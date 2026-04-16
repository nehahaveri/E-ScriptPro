package com.escriptpro.authservice.dto;

import com.escriptpro.authservice.entity.Role;
import com.escriptpro.authservice.validation.PhoneNumber;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequestDTO {

    @Size(max = 120, message = "Name must be at most 120 characters")
    private String name;

    @Email(message = "Email must be valid")
    @Size(max = 254, message = "Email must be at most 254 characters")
    private String email;

    @PhoneNumber(defaultRegion = "IN", allowBlank = true)
    private String phone;

    @Size(min = 12, max = 72, message = "Password must be between 12 and 72 characters")
    private String password;

    private Role role;

    @Positive(message = "Doctor ID must be a positive number")
    private Long doctorId;
}
