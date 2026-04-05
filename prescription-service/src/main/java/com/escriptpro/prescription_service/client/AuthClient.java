package com.escriptpro.prescription_service.client;

import com.escriptpro.prescription_service.dto.DoctorResponseDTO;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class AuthClient {

    private final RestTemplate restTemplate;

    public AuthClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Long getDoctorIdByEmail(String email) {
        DoctorResponseDTO doctorResponse = restTemplate.getForObject(
                "http://localhost:8080/auth/doctor?email={email}",
                DoctorResponseDTO.class,
                email
        );

        if (doctorResponse == null || doctorResponse.getId() == null) {
            throw new RuntimeException("Doctor not found for email: " + email);
        }

        return doctorResponse.getId();
    }
}
