package com.voyexa.backend.controller;

import com.voyexa.backend.DTOS.PlaceDto;
import com.voyexa.backend.DTOS.TripGenerationRequestDto;
import com.voyexa.backend.DTOS.TripGenerationResponseDto;
import com.voyexa.backend.DTOS.TripRequestDto;
import com.voyexa.backend.DTOS.TripResponseDto;
import com.voyexa.backend.DTOS.TripSummaryDto;
import com.voyexa.backend.services.ExternalPlaceService;
import com.voyexa.backend.services.ItineraryService;
import com.voyexa.backend.services.TripService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(origins = "http://localhost:5173")
public class TripController {

    private final ExternalPlaceService externalPlaceService;
    private final TripService tripService;
    private final ItineraryService itineraryService;

    public TripController(
            ExternalPlaceService externalPlaceService,
            TripService tripService,
            ItineraryService itineraryService) {
        this.externalPlaceService = externalPlaceService;
        this.tripService = tripService;
        this.itineraryService = itineraryService;
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

        // 2. Generate the itinerary JSON (with images injected for the frontend to
        // display).
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
}
