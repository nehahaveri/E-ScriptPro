package com.escriptpro.doctor_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorProfileUpdateDTO {

    private String name;
    private String phone;
    private String clinicName;
    private String locality;
    private String specialization;
    private String education;
    private Integer experience;
    private String logoUrl;
    private String signatureUrl;
}
