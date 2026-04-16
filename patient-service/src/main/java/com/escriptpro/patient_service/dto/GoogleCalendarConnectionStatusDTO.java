package com.escriptpro.patient_service.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleCalendarConnectionStatusDTO {

    private boolean oauthConfigured;
    private boolean connected;
    private String doctorEmail;
    private String googleEmail;
    private LocalDateTime accessTokenExpiresAt;
    private LocalDateTime lastSyncedAt;
}
