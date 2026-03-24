package com.voyexa.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;

@Getter
@Setter
@Entity
@Table(name = "traveler_profiles")
public class TravelerProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Size(max = 100)
    @NotNull
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Size(max = 20)
    @Column(name = "relation", length = 20)
    private String relation;

    @Column(name = "dob")
    private LocalDate dob;

    @Size(max = 10)
    @Column(name = "gender", length = 10)
    private String gender;

    @Size(max = 20)
    @Column(name = "dietary_preferences", length = 20)
    private String dietaryPreferences;

    @Size(max = 30)
    @Column(name = "mobility_level", length = 30)
    private String mobilityLevel;

    @Size(max = 50)
    @Column(name = "nationality", length = 50)
    private String nationality;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "interests")
    private Map<String, Object> interests;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;


}