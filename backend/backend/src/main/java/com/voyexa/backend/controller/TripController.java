package com.voyexa.backend.controller;

import com.voyexa.backend.DTOS.PlaceDto;
import com.voyexa.backend.DTOS.TripGenerationRequestDto;
import com.voyexa.backend.DTOS.TripRequestDto;
import com.voyexa.backend.DTOS.TripResponseDto;
import com.voyexa.backend.services.ExternalPlaceService;
import com.voyexa.backend.services.ItineraryService;
import com.voyexa.backend.services.TripService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
            ItineraryService itineraryService
    ) {
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
    public ResponseEntity<String> generateItinerary(@Valid @RequestBody TripGenerationRequestDto dto) {
        // Persist user trip preferences from the same request even if itinerary storage is postponed.
        tripService.createTripFromGenerationRequest(dto);

        String itineraryJson = itineraryService.generateItinerary(dto);
        return ResponseEntity.ok(itineraryJson);
    }
}
