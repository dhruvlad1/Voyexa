package com.voyexa.backend.services;

import com.voyexa.backend.DTOS.UserRegistrationDto;
import com.voyexa.backend.DTOS.UserLoginDto;
import com.voyexa.backend.entities.User;
import com.voyexa.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public String registerUser(UserRegistrationDto dto) {
        // Check if user already exists
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            return "User with this email already exists.";
        }

        // Create new user
        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());  // In production, hash this!
        user.setPhone_number(dto.getPhone_number());
        user.setCreated_at(LocalDateTime.now());
        user.setUpdated_at(LocalDateTime.now());

        userRepository.save(user);
        return "User registered successfully.";
    }

    public String loginUser(UserLoginDto dto) {
        Optional<User> userOpt = userRepository.findByEmail(dto.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword().equals(dto.getPassword())) {  // In production, compare hashed passwords
                return "Login successful.";
            } else {
                return "Invalid password.";
            }
        } else {
            return "User not found.";
        }
    }
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
