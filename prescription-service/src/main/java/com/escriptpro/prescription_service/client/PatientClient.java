package com.escriptpro.prescription_service.client;

import com.escriptpro.prescription_service.dto.PatientResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

@Component
public class PatientClient {

    private final RestTemplate restTemplate;

    public PatientClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public PatientResponseDTO getPatientById(Long patientId, String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        try {
            ResponseEntity<PatientResponseDTO> response = restTemplate.exchange(
                    "http://localhost:8082/patients/{patientId}",
                    HttpMethod.GET,
                    entity,
                    PatientResponseDTO.class,
                    patientId
            );

            PatientResponseDTO body = response.getBody();
            if (body == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found");
            }
            return body;
        } catch (HttpStatusCodeException ex) {
            throw new ResponseStatusException(
                    HttpStatus.valueOf(ex.getStatusCode().value()),
                    "Patient ownership validation failed"
            );
        }
    }
}
