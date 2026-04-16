package com.escriptpro.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorAuthProfileDTO {

    private Long id;
    private String email;
    private String phone;
}
