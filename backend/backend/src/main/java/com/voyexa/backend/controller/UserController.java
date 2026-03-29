package com.voyexa.backend.controller;

import com.voyexa.backend.DTOS.UserLoginResponseDto;
import com.voyexa.backend.DTOS.UserRegistrationDto;
import com.voyexa.backend.DTOS.UserLoginDto;
import com.voyexa.backend.entities.User;
import com.voyexa.backend.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody UserRegistrationDto dto) {
        String message = userService.registerUser(dto);
        return ResponseEntity.ok(message);
    }

    @PostMapping("/login")
    public ResponseEntity<UserLoginResponseDto> login(@RequestBody UserLoginDto dto) {
        UserLoginResponseDto response = userService.loginUser(dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }
}
