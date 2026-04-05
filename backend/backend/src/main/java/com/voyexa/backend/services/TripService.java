package com.voyexa.backend.services;

import com.voyexa.backend.DTOS.TripGenerationRequestDto;
import com.voyexa.backend.DTOS.TripRequestDto;
import com.voyexa.backend.DTOS.TripResponseDto;
import com.voyexa.backend.entities.Trip;
import com.voyexa.backend.entities.User;
import com.voyexa.backend.repositories.TripRepository;
import com.voyexa.backend.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

@Service
public class TripService {

    private static final Set<String> ALLOWED_GROUPS = Set.of("solo", "couple", "friends", "family");

    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    public TripService(TripRepository tripRepository, UserRepository userRepository) {
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
    }

    public TripResponseDto createTrip(TripRequestDto dto) {
        validateDates(dto);
        String normalizedGroup = normalizeGroup(dto.getTravelers());

        Optional<User> userOpt = userRepository.findById(dto.getUserId());
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found.");
        }

        int adultCount = dto.getAdultCount() == null ? 0 : dto.getAdultCount();
        int childCount = dto.getChildCount() == null ? 0 : dto.getChildCount();

        // Align counts with selected travel group.
        if ("solo".equals(normalizedGroup)) {
            adultCount = 1;
            childCount = 0;
        } else if ("couple".equals(normalizedGroup)) {
            adultCount = 2;
            childCount = 0;
        }

        if (adultCount < 1) {
            throw new IllegalArgumentException("adultCount must be at least 1.");
        }
        if (childCount < 0) {
            throw new IllegalArgumentException("childCount cannot be negative.");
        }

        Trip trip = new Trip();
        trip.setUser(userOpt.get());
        trip.setOrigin(dto.getOrigin().trim());
        trip.setDestination(dto.getDestination().trim());
        trip.setStartDate(dto.getStartDate());
        trip.setEndDate(dto.getEndDate());
        trip.setDateFlexibility(dto.getDateFlexibility());
        trip.setTravelGroupType(normalizedGroup);
        trip.setAdultCount(adultCount);
        trip.setChildCount(childCount);

        if (dto.getInterests() != null) {
            trip.setInterests(dto.getInterests().toArray(new String[0]));
        } else {
            trip.setInterests(new String[0]);
        }

        trip.setOtherInterest(dto.getOtherInterest());
        trip.setAccommodationPreference(dto.getAccommodationPreference());
        trip.setTripPace(dto.getTripPace());
        trip.setBudget(dto.getBudget());
        // status + timestamps handled by @PrePersist in Trip entity

        Trip saved = tripRepository.save(trip);
        return new TripResponseDto(saved.getId(), "Trip preferences saved.");
    }

    public void createTripFromGenerationRequest(TripGenerationRequestDto dto) {
        TripRequestDto tripRequestDto = new TripRequestDto();
        tripRequestDto.setUserId(dto.getUserId());
        tripRequestDto.setOrigin(dto.getOrigin());
        tripRequestDto.setDestination(dto.getDestination());
        tripRequestDto.setStartDate(dto.getStartDate());
        tripRequestDto.setEndDate(dto.getEndDate());
        tripRequestDto.setDateFlexibility(dto.getFlexibility());
        tripRequestDto.setTravelers(dto.getTravelers());

        if (dto.getAdultCount() != null || dto.getChildCount() != null) {
            tripRequestDto.setAdultCount(dto.getAdultCount() == null ? 0 : dto.getAdultCount());
            tripRequestDto.setChildCount(dto.getChildCount() == null ? 0 : dto.getChildCount());
        } else if ("Solo".equalsIgnoreCase(dto.getTravelers())) {
            tripRequestDto.setAdultCount(1);
            tripRequestDto.setChildCount(0);
        } else if ("Couple".equalsIgnoreCase(dto.getTravelers())) {
            tripRequestDto.setAdultCount(2);
            tripRequestDto.setChildCount(0);
        } else {
            tripRequestDto.setAdultCount(dto.getTravelerCount());
            tripRequestDto.setChildCount(0);
        }

        tripRequestDto.setInterests(dto.getInterests());
        tripRequestDto.setOtherInterest(dto.getOtherInterests() == null ? null : String.join(", ", dto.getOtherInterests()));
        tripRequestDto.setAccommodationPreference(dto.getAccommodationType());
        tripRequestDto.setTripPace(dto.getTravelPace());
        tripRequestDto.setBudget(dto.getBudget());

        createTrip(tripRequestDto);
    }

    private void validateDates(TripRequestDto dto) {
        if (dto.getStartDate().isAfter(dto.getEndDate())) {
            throw new IllegalArgumentException("startDate cannot be after endDate.");
        }
    }

    private String normalizeGroup(String travelers) {
        String normalized = travelers == null ? "" : travelers.trim().toLowerCase(Locale.ROOT);
        if (!ALLOWED_GROUPS.contains(normalized)) {
            throw new IllegalArgumentException(
                    "Invalid travelers value. Allowed: " + Arrays.toString(ALLOWED_GROUPS.toArray())
            );
        }
        return normalized;
    }
}
