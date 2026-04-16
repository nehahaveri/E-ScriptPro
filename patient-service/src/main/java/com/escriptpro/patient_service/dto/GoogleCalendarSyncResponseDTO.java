package com.escriptpro.patient_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleCalendarSyncResponseDTO {

    private String status;
    private String eventId;
    private String htmlLink;
}
