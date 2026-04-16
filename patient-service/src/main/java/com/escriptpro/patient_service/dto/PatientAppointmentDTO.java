package com.escriptpro.patient_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientAppointmentDTO {

    private Long patientId;
    private Long patientNumber;
    private String patientName;
    private String patientMobile;
    private Integer patientAge;
    private String patientGender;
    private String appointmentDate;
    private String appointmentTime;
    private String appointmentStatus;
    private Integer appointmentReminderMinutes;
}
