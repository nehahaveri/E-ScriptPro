package com.escriptpro.prescription_service.client;

import com.escriptpro.prescription_service.dto.DoctorResponseDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

@Component
public class DoctorClient {

    private final RestTemplate restTemplate;
    private final String doctorServiceUrl;

    public DoctorClient(RestTemplate restTemplate, @Value("${services.doctor-service.url}") String doctorServiceUrl) {
        this.restTemplate = restTemplate;
        this.doctorServiceUrl = doctorServiceUrl;
    }

    public Long getDoctorIdByEmail(String email, String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        ResponseEntity<DoctorResponseDTO> response = restTemplate.exchange(
                doctorServiceUrl + "/doctors/email/{email}",
                HttpMethod.GET,
                entity,
                DoctorResponseDTO.class,
                email
        );
        DoctorResponseDTO doctorResponse = response.getBody();

        if (doctorResponse == null || doctorResponse.getId() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found for email: " + email);
        }

        return doctorResponse.getId();
    }
}
