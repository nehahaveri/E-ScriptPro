package com.escriptpro.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InitiateSignupResponseDTO {
    private String message;
    private String signupToken;
}
