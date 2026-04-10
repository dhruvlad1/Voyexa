package com.voyexa.backend.controller;

import com.voyexa.backend.DTOS.DestinationDto;
import com.voyexa.backend.services.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/trending")
    public ResponseEntity<List<DestinationDto>> getTrendingDestinations() {
        List<DestinationDto> trending = dashboardService.getTrendingDestinationsMonth();
        return ResponseEntity.ok(trending);
    }
}
