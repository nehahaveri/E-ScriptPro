package com.escriptpro.patient_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleCalendarConnectResponseDTO {

    private String authorizationUrl;
    private String state;
}
