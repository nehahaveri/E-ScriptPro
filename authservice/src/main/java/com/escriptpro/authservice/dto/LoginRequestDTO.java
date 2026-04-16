package com.escriptpro.authservice.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequestDTO {

    @NotBlank(message = "Identifier is required")
    @JsonAlias("email")
    private String identifier;

    @NotBlank(message = "Password is required")
    private String password;
}
