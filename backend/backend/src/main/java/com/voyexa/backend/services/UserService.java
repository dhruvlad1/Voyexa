package com.voyexa.backend.services;

import com.voyexa.backend.DTOS.UserLoginResponseDto;
import com.voyexa.backend.DTOS.UserRegistrationDto;
import com.voyexa.backend.DTOS.UserLoginDto;
import com.voyexa.backend.entities.User;
import com.voyexa.backend.exceptions.DuplicateUserException;
import com.voyexa.backend.repositories.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    public String registerUser(UserRegistrationDto dto) {
        Map<String, String> duplicateErrors = new LinkedHashMap<>();

        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            duplicateErrors.put("email", "Email is already registered please try login.");
        }

        if (userRepository.findByPhoneNumber(dto.getPhone_number()).isPresent()) {
            duplicateErrors.put("phone_number", "Phone number is already registered please try login.");
        }

        if (!duplicateErrors.isEmpty()) {
            throw new DuplicateUserException(duplicateErrors);
        }

        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setPhone_number(dto.getPhone_number());
        user.setCreated_at(LocalDateTime.now());
        user.setUpdated_at(LocalDateTime.now());

        userRepository.save(user);
        return "User registered successfully.";
    }

    public UserLoginResponseDto loginUser(UserLoginDto dto) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword())
        );

        Optional<User> userOpt = userRepository.findByEmail(dto.getEmail());
        User user = userOpt.orElseThrow(() -> new IllegalArgumentException("User not found."));
        return new UserLoginResponseDto(user.getUser_id(), user.getName(), user.getEmail(), user.getPhone_number(), "Login successful.");
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
