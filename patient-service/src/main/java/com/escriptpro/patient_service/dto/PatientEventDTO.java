package com.escriptpro.patient_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientEventDTO {

    private String eventType;
    private Long patientId;
    private Long patientNumber;
    private Long doctorId;
    private String actorRole;
    private String actorEmail;
    private String name;
    private String mobile;
    private String appointmentDate;
    private String appointmentTime;
    private String appointmentStatus;
}
