package com.escriptpro.patient_service.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientRequest {

    @NotBlank(message = "Patient name is required")
    @Size(max = 120, message = "Patient name must be at most 120 characters")
    private String name;

    @Min(value = 0, message = "Age must be at least 0")
    @Max(value = 150, message = "Age must be at most 150")
    private Integer age;

    @NotBlank(message = "Gender is required")
    private String gender;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Mobile number must be exactly 10 digits")
    private String mobile;

    @Size(max = 255, message = "Address must be at most 255 characters")
    private String address;

    @Min(value = 0, message = "Height must be at least 0")
    @Max(value = 300, message = "Height must be at most 300 cm")
    private Integer height;

    @Min(value = 0, message = "Weight must be at least 0")
    @Max(value = 500, message = "Weight must be at most 500 kg")
    private Integer weight;
}
