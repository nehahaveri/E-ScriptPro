package com.escriptpro.prescription_service.client;

import com.escriptpro.prescription_service.dto.DoctorResponseDTO;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class DoctorClient {

    private final RestTemplate restTemplate;

    public DoctorClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Long getDoctorIdByEmail(String email, String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        ResponseEntity<DoctorResponseDTO> response = restTemplate.exchange(
                "http://localhost:8086/doctors/email/{email}",
                HttpMethod.GET,
                entity,
                DoctorResponseDTO.class,
                email
        );
        DoctorResponseDTO doctorResponse = response.getBody();

        if (doctorResponse == null || doctorResponse.getId() == null) {
            throw new RuntimeException("Doctor not found for email: " + email);
        }

        return doctorResponse.getId();
    }
}
