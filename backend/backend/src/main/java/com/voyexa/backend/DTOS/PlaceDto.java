package com.voyexa.backend.DTOS;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PlaceDto {
    private int id;
    private String name;
    private String country;
    private String region;
    private String description;

   public String getDisplayName() {
        return name + ", " + country;
    }
}
