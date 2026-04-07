package com.escriptpro.doctor_service.dto;

import com.escriptpro.doctor_service.validation.PhoneNumber;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorProfileUpdateDTO {

    @Size(max = 120, message = "Name must be at most 120 characters")
    private String name;

    @PhoneNumber(defaultRegion = "IN")
    private String phone;

    @Size(max = 160, message = "Clinic name must be at most 160 characters")
    private String clinicName;

    @Size(max = 160, message = "Locality must be at most 160 characters")
    private String locality;

    @Size(max = 160, message = "Specialization must be at most 160 characters")
    private String specialization;

    @Size(max = 160, message = "Education must be at most 160 characters")
    private String education;

    private Integer experience;
    private String logoUrl;
    private String signatureUrl;
}
