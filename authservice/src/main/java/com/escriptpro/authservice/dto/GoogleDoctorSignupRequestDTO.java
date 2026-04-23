package com.escriptpro.authservice.dto;

import com.escriptpro.authservice.validation.PhoneNumber;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GoogleDoctorSignupRequestDTO(
        @NotBlank(message = "Google ID token is required")
        String idToken,
        @Size(max = 120, message = "Name must be at most 120 characters")
        String name,
        @PhoneNumber(defaultRegion = "IN", allowBlank = false)
        String phone,
        @NotBlank(message = "Password is required")
        @Size(min = 12, max = 72, message = "Password must be between 12 and 72 characters")
        String password
) {
}
