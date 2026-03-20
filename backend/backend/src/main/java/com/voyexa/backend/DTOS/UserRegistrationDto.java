package com.voyexa.backend.DTOS;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserRegistrationDto {
    private String name;
    private String email;

    @NotBlank(message = "Password is required.")
    @Size(min = 8, max = 25, message = "Password must be between 8 and 25 characters.")
    @Pattern(
            regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,25}$",
            message = "Password must contain at least 1 letter and 1 number."
    )
    private String password;

    private String phone_number;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;
}
