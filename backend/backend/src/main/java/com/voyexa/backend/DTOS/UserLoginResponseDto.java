package com.voyexa.backend.DTOS;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserLoginResponseDto {
    private Integer userId;
    private String name;
    private String message;
}
