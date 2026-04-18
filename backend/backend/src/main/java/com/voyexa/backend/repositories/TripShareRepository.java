package com.voyexa.backend.repositories;

import com.voyexa.backend.entities.TripShare;
import com.voyexa.backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TripShareRepository extends JpaRepository<TripShare, UUID> {

    Optional<TripShare> findByShareToken(String shareToken);

    Optional<TripShare> findByTripIdAndOwner(UUID tripId, User owner);
}

