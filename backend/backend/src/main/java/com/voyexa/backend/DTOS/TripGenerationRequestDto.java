package com.voyexa.backend.DTOS;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class TripGenerationRequestDto {

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

    @NotBlank
    private String flexibility;

    // Categorical traveler profile (Solo/Couple/Friends/Family, etc.)
    @NotBlank
    private String travelers;

    @NotNull
    @Min(1)
    private Integer travelerCount;

    @Min(0)
    private Integer adultCount;

    @Min(0)
    private Integer childCount;

    @NotBlank
    private String budget;

    @NotBlank
    private String accommodationType;

    @NotBlank
    private String travelPace;

    @NotNull
    private List<String> interests = new ArrayList<>();

    @NotNull
    private List<String> otherInterests = new ArrayList<>();

    @Valid
    @NotNull
    private PromptMetadata promptMetadata = new PromptMetadata();

    @Getter
    @Setter
    public static class PromptMetadata {
        private String promptVersion;
        private String responseFormat;
        private Boolean strictJsonOnly = Boolean.TRUE;
        private String locale;
        private String currency;
        private String notes;
    }
}
