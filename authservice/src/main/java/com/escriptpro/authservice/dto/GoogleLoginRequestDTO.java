package com.escriptpro.authservice.dto;

import jakarta.validation.constraints.NotBlank;

public record GoogleLoginRequestDTO(
    @NotBlank(message = "Google ID token is required")
    String idToken
) {}