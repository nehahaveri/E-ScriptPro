package com.escriptpro.receptionist_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReceptionistRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 120, message = "Name must be at most 120 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 254, message = "Email must be at most 254 characters")
    private String email;

    @NotBlank(message = "Phone is required")
    @Size(max = 30, message = "Phone must be at most 30 characters")
    private String phone;

    @Positive(message = "Doctor ID must be a positive number")
    private Long doctorId;
}
