package com.voyexa.backend.DTOS;

import lombok.*;

import java.util.Map;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TripForkRequestDto {

    private String variationName; // Name for the forked trip variation

    private Map<String, Object> itineraryJson; // Optional: if modifying itinerary in fork
}

