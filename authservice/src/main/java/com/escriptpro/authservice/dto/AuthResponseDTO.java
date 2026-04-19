package com.escriptpro.authservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponseDTO {

    private String message;
    private String token;
    private String refreshToken;
    private Long doctorId;
    private String role;
}
