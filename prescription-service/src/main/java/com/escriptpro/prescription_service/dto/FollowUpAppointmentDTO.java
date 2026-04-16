package com.escriptpro.prescription_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FollowUpAppointmentDTO {

    private Long prescriptionId;
    private Long patientId;
    private Long patientNumber;
    private String patientName;
    private String patientMobile;
    private Integer patientAge;
    private String patientGender;
    private String followUpDate;
    private String diagnosis;
}
