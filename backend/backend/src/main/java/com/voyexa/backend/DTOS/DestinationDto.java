package com.voyexa.backend.DTOS;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DestinationDto {
    private String city;
    private String country;
    private String description;
    private Integer budget;
    private String imageUrl;
}
