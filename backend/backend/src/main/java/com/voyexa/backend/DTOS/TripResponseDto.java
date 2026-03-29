package com.voyexa.backend.DTOS;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class TripResponseDto {
    private UUID tripId;
    private String message;
}
