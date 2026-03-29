package com.voyexa.backend.DTOS;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class TripRequestDto {

    @NotNull
    private Integer userId;

    @NotBlank
    private String origin;

    @NotBlank
    private String destination;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    private String dateFlexibility;

    // Frontend currently uses "travelers" (Solo/Couple/Friends/Family)
    @NotBlank
    private String travelers;

    @Min(0)
    private Integer adultCount = 1;

    @Min(0)
    private Integer childCount = 0;

    private List<String> interests;
    private String otherInterest;
    private String accommodationPreference;
    private String tripPace;
    private String budget;
}
