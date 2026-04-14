package com.voyexa.backend.DTOS;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripSummaryDto {
    private UUID id;
    private String origin;
    private String destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private Map<String, Object> itineraryJson;
    private String budget;
    private Integer adultCount;
    private Integer childCount;
    private String travelGroupType;
    private String dateFlexibility;
    private String[] interests;
    private String otherInterest;
    private String accommodationPreference;
    private String tripPace;
}
