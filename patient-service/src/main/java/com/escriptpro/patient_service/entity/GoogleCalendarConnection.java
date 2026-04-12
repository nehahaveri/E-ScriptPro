package com.escriptpro.patient_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "google_calendar_connections")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleCalendarConnection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long doctorId;

    @Column(nullable = false)
    private String doctorEmail;

    private String googleEmail;

    @Column(length = 4096)
    private String accessToken;

    @Column(length = 4096)
    private String refreshToken;

    private LocalDateTime accessTokenExpiresAt;

    @Column(length = 1024)
    private String scopes;

    private LocalDateTime connectedAt;

    private LocalDateTime updatedAt;

    private LocalDateTime lastSyncedAt;
}
