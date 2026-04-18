package com.voyexa.backend.DTOS;

import lombok.*;

import java.util.List;
import java.util.Map;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ReorderItineraryRequestDto {

    private List<Integer> dayOrder; // New order of day numbers: [1, 3, 2] means day 1, then 3, then 2

    private Map<String, Object> itineraryJson; // Updated itinerary with reordered days
}

