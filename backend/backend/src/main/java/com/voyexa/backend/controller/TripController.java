package com.voyexa.backend.controller;

import com.voyexa.backend.DTOS.AlternativeGenerationRequestDto;
import com.voyexa.backend.DTOS.AlternativeGenerationResponseDto;
import com.voyexa.backend.DTOS.OnDemandAlternativeRequestDto;
import com.voyexa.backend.DTOS.PlaceDto;
import com.voyexa.backend.DTOS.ReorderItineraryRequestDto;
import com.voyexa.backend.DTOS.TripForkRequestDto;
import com.voyexa.backend.DTOS.TripGenerationRequestDto;
import com.voyexa.backend.DTOS.TripGenerationResponseDto;
import com.voyexa.backend.DTOS.TripRequestDto;
import com.voyexa.backend.DTOS.TripResponseDto;
import com.voyexa.backend.DTOS.TripSummaryDto;
import com.voyexa.backend.DTOS.TripShareResponseDto;
import com.voyexa.backend.entities.Trip;
import com.voyexa.backend.services.ActivityAlternativeService;
import com.voyexa.backend.services.ExternalPlaceService;
import com.voyexa.backend.services.ItineraryService;
import com.voyexa.backend.services.OnDemandAlternativeService;
import com.voyexa.backend.services.TripService;
import com.voyexa.backend.services.TripShareService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final ExternalPlaceService externalPlaceService;
    private final TripService tripService;
    private final ItineraryService itineraryService;
    private final ActivityAlternativeService activityAlternativeService;
    private final OnDemandAlternativeService onDemandAlternativeService;
    private final TripShareService tripShareService;

    public TripController(
            ExternalPlaceService externalPlaceService,
            TripService tripService,
            ItineraryService itineraryService,
            ActivityAlternativeService activityAlternativeService,
            OnDemandAlternativeService onDemandAlternativeService,
            TripShareService tripShareService) {
        this.externalPlaceService = externalPlaceService;
        this.tripService = tripService;
        this.itineraryService = itineraryService;
        this.activityAlternativeService = activityAlternativeService;
        this.onDemandAlternativeService = onDemandAlternativeService;
        this.tripShareService = tripShareService;
    }

    @GetMapping("/places/search")
    public ResponseEntity<List<PlaceDto>> searchPlaces(@RequestParam String query) {
        List<PlaceDto> results = externalPlaceService.searchPlaces(query);
        return ResponseEntity.ok(results);
    }

    @PostMapping
    public ResponseEntity<TripResponseDto> createTrip(@Valid @RequestBody TripRequestDto dto) {
        TripResponseDto response = tripService.createTrip(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/generate")
    public ResponseEntity<TripGenerationResponseDto> generateItinerary(
            @Valid @RequestBody TripGenerationRequestDto dto) {
        // 1. Persist user trip preferences and retrieve the saved trip's ID.
        TripResponseDto savedTrip = tripService.createTripFromGenerationRequest(dto);

        // 2. Generate the base itinerary JSON first (without image URLs).
        String itineraryJson = itineraryService.generateItinerary(dto);

        // 3. Return both tripId + itineraryJson so the frontend can display the result
        // and later call PUT /{tripId}/itinerary to persist the user's chosen
        // itinerary.
        TripGenerationResponseDto response = new TripGenerationResponseDto(savedTrip.getTripId(), itineraryJson);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/inject-images")
    public ResponseEntity<Map<String, Object>> injectImages(@RequestBody Map<String, Object> itineraryMap) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            String jsonStr = mapper.writeValueAsString(itineraryMap);
            String populatedJson = itineraryService.injectImagesIntoItinerary(jsonStr);
            Map<String, Object> responseMap = mapper.readValue(populatedJson, Map.class);
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping(value = "/inject-images-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter injectImagesStream(@RequestBody Map<String, Object> itineraryMap) {
        SseEmitter emitter = new SseEmitter(0L);

        CompletableFuture.runAsync(() -> {
            try {
                ObjectMapper mapper = new ObjectMapper();
                String jsonStr = mapper.writeValueAsString(itineraryMap);
                sendSse(emitter, "status", Map.of("message", "Generating activity images"));

                itineraryService.streamImageUpdates(jsonStr, imageUpdate -> {
                    Map<String, Object> payload = new HashMap<>();
                    payload.put("dayNumber", imageUpdate.getDayNumber());
                    payload.put("timeSlot", imageUpdate.getTimeSlot());
                    payload.put("imageUrl", imageUpdate.getImageUrl());
                    if (imageUpdate.getAlternativeIndex() != null) {
                        payload.put("alternativeIndex", imageUpdate.getAlternativeIndex());
                    }
                    sendSseUnchecked(emitter, "image-update", payload);
                });

                sendSse(emitter, "complete", Map.of("done", true));
                emitter.complete();
            } catch (Exception e) {
                sendSseUnchecked(emitter, "error", Map.of("message", "Failed to inject images."));
                emitter.complete();
            }
        });

        return emitter;
    }

    private void sendSse(SseEmitter emitter, String eventName, Map<String, Object> payload) throws java.io.IOException {
        emitter.send(SseEmitter.event().name(eventName).data(payload, MediaType.APPLICATION_JSON));
    }

    private void sendSseUnchecked(SseEmitter emitter, String eventName, Map<String, Object> payload) {
        try {
            sendSse(emitter, eventName, payload);
        } catch (Exception ignored) {
            // Client may disconnect while streaming.
        }
    }

    @PutMapping("/{tripId}/itinerary")
    public ResponseEntity<Void> saveItinerary(
            @PathVariable UUID tripId,
            @RequestBody Map<String, Object> itineraryMap) {
        try {
            tripService.saveItineraryToTrip(tripId, itineraryMap);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TripSummaryDto>> getTripsByUser(@PathVariable int userId) {
        List<TripSummaryDto> trips = tripService.getTripsByUserId(userId);
        return ResponseEntity.ok(trips);
    }

    /**
     * Get activity alternatives for a specific time slot in the trip.
     * Returns cached alternatives if available, otherwise generates new ones via Gemini.
     */
    @PostMapping("/{tripId}/alternatives")
    public ResponseEntity<AlternativeGenerationResponseDto> getActivityAlternatives(
            @PathVariable UUID tripId,
            @Valid @RequestBody AlternativeGenerationRequestDto requestDto) {
        try {
            requestDto.setTripId(tripId);
            AlternativeGenerationResponseDto response = activityAlternativeService.getAlternatives(requestDto);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * On-demand alternatives endpoint used only when user explicitly clicks "Get Alternatives".
     * Generates (or returns cached) alternatives for one day/time slot.
     */
    @PostMapping("/{tripId}/alternatives/on-demand")
    public ResponseEntity<AlternativeGenerationResponseDto> getOnDemandAlternatives(
            @PathVariable UUID tripId,
            @Valid @RequestBody OnDemandAlternativeRequestDto requestDto) {
        try {
            AlternativeGenerationResponseDto response = onDemandAlternativeService.getAlternatives(tripId, requestDto);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Apply a selected alternative activity to the trip's itinerary.
     * Updates both the alternative record and the trip's itinerary JSON.
     */
    @PutMapping("/{tripId}/apply-alternative")
    public ResponseEntity<Void> applyAlternativeActivity(
            @PathVariable UUID tripId,
            @RequestParam Integer dayNumber,
            @RequestParam String timeSlot,
            @RequestParam Integer selectedIndex) {
        try {
            activityAlternativeService.applyAlternative(tripId, dayNumber, timeSlot, selectedIndex);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Reorder days in the itinerary
     */
    @PutMapping("/{tripId}/reorder")
    public ResponseEntity<Void> reorderItinerary(
            @PathVariable UUID tripId,
            @Valid @RequestBody ReorderItineraryRequestDto requestDto) {
        try {
            tripService.reorderItinerary(tripId, requestDto);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Fork (create variation) of a trip
     */
    @PostMapping("/{tripId}/fork")
    public ResponseEntity<TripResponseDto> forkTrip(
            @PathVariable UUID tripId,
            @Valid @RequestBody TripForkRequestDto requestDto) {
        try {
            TripResponseDto response = tripService.forkTrip(tripId, requestDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Create a shareable link for a trip
     */
    @PostMapping("/{tripId}/share")
    public ResponseEntity<TripShareResponseDto> createShareLink(
            @PathVariable UUID tripId,
            @RequestParam Integer userId) {
        try {
            TripShareResponseDto response = tripShareService.createShareLink(tripId, userId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get a shared trip by share token (public endpoint)
     */
    @GetMapping("/shared/{shareToken}")
    public ResponseEntity<Map<String, Object>> getSharedTrip(@PathVariable String shareToken) {
        try {
            Trip trip = tripShareService.getSharedTrip(shareToken);
            Map<String, Object> response = new HashMap<>();
            response.put("trip", trip);
            response.put("tripId", trip.getId());
            response.put("itineraryJson", trip.getItineraryJson());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
