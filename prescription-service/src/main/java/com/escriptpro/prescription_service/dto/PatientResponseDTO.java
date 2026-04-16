package com.escriptpro.prescription_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientResponseDTO {

    private Long id;
    private Long patientNumber;
    private String name;
    private Integer age;
    private String gender;
    private String mobile;
    private String address;
    private String appointmentDate;
    private Integer height;
    private Integer weight;
    private Long doctorId;
}
