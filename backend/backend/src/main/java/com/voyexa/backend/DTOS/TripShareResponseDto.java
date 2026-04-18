package com.voyexa.backend.DTOS;

import lombok.*;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TripShareResponseDto {

    private String shareToken;

    private String shareUrl;

    private Boolean isPublic;

    private Integer viewCount;
}

