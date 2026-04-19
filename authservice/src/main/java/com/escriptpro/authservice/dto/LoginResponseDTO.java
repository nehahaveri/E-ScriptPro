package com.escriptpro.authservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LoginResponseDTO {

    private String message;
    private Boolean mfaRequired;
    private String mfaChallengeToken;
    private String token;
    private String refreshToken;
    private Long doctorId;
    private String role;
}
