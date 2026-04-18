package com.voyexa.backend.services;


import com.voyexa.backend.DTOS.TripShareResponseDto;
import com.voyexa.backend.entities.Trip;
import com.voyexa.backend.entities.TripShare;
import com.voyexa.backend.entities.User;
import com.voyexa.backend.repositories.TripRepository;
import com.voyexa.backend.repositories.TripShareRepository;
import com.voyexa.backend.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.UUID;

@Service
public class TripShareService {

    private final TripShareRepository tripShareRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public TripShareService(TripShareRepository tripShareRepository, TripRepository tripRepository, UserRepository userRepository) {
        this.tripShareRepository = tripShareRepository;
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
    }

    /**
     * Create or get a share link for a trip
     */
    @Transactional
    public TripShareResponseDto createShareLink(UUID tripId, Integer userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check if share already exists
        var existing = tripShareRepository.findByTripIdAndOwner(tripId, user);
        if (existing.isPresent()) {
            return mapToResponse(existing.get());
        }

        // Create new share
        TripShare tripShare = new TripShare();
        tripShare.setTrip(trip);
        tripShare.setOwner(user);
        tripShare.setShareToken(generateShareToken());
        tripShare.setIsPublic(true);

        TripShare saved = tripShareRepository.save(tripShare);
        return mapToResponse(saved);
    }

    /**
     * Get trip by share token (public access)
     */
    @Transactional
    public Trip getSharedTrip(String shareToken) {
        TripShare tripShare = tripShareRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new IllegalArgumentException("Share link not found or expired"));

        // Increment view count
        tripShare.setViewCount(tripShare.getViewCount() + 1);
        tripShareRepository.save(tripShare);

        return tripShare.getTrip();
    }

    /**
     * Generate a secure random token
     */
    private String generateShareToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /**
     * Map to response DTO
     */
    private TripShareResponseDto mapToResponse(TripShare tripShare) {
        String shareUrl = frontendUrl + "/share/" + tripShare.getShareToken();

        return TripShareResponseDto.builder()
                .shareToken(tripShare.getShareToken())
                .shareUrl(shareUrl)
                .isPublic(tripShare.getIsPublic())
                .viewCount(tripShare.getViewCount())
                .build();
    }
}

