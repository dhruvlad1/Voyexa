package com.voyexa.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "trips")
public class Trip {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Size(max = 255)
    @Column(name = "origin", length = 255)
    private String origin;

    @Size(max = 255)
    @Column(name = "destination", length = 255)
    private String destination;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Size(max = 50)
    @Column(name = "date_flexibility", length = 50)
    private String dateFlexibility;

    @Size(max = 20)
    @Column(name = "travel_group_type", length = 20)
    private String travelGroupType;

    @NotNull
    @Column(name = "adult_count", nullable = false)
    private Integer adultCount;

    @Column(name = "child_count")
    private Integer childCount;

    // Maps to Postgres TEXT[]
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "interests", columnDefinition = "text[]")
    private String[] interests;

    @Column(name = "other_interest", columnDefinition = "text")
    private String otherInterest;

    @Size(max = 50)
    @Column(name = "accommodation_preference", length = 50)
    private String accommodationPreference;

    @Size(max = 50)
    @Column(name = "trip_pace", length = 50)
    private String tripPace;

    @Size(max = 50)
    @Column(name = "budget", length = 50)
    private String budget;

    @Size(max = 50)
    @Column(name = "status", length = 50)
    private String status;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "itinerary_json", columnDefinition = "jsonb")
    private Map<String, Object> itineraryJson;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
        if (status == null || status.isBlank()) {
            status = "PENDING";
        }
        if (childCount == null) {
            childCount = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
