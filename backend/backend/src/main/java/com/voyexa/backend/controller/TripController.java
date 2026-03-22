package com.voyexa.backend.controller;

import com.voyexa.backend.DTOS.PlaceDto;
import com.voyexa.backend.services.ExternalPlaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(origins = "http://localhost:5173")
public class TripController {

    private final ExternalPlaceService externalPlaceService;

    public TripController(ExternalPlaceService externalPlaceService) {
        this.externalPlaceService = externalPlaceService;
    }

    @GetMapping("/places/search")
    public ResponseEntity<List<PlaceDto>> searchPlaces(@RequestParam String query) {
        List<PlaceDto> results = externalPlaceService.searchPlaces(query);
        return ResponseEntity.ok(results);
    }
}
