package com.escriptpro.patient_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientRequest {

    private String name;

    private Integer age;

    private String gender;

    private String mobile;
}
