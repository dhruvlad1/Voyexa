package com.voyexa.backend.repositories;

import com.voyexa.backend.entities.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

@Repository
public interface TripRepository extends JpaRepository<Trip, UUID> {
    
    @Query("SELECT t FROM Trip t WHERE t.user.user_id = :userId ORDER BY t.createdAt DESC")
    List<Trip> findByUserId(@Param("userId") int userId);
}
