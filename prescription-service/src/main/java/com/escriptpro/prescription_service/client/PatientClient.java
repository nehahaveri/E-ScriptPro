package com.escriptpro.prescription_service.client;

import com.escriptpro.prescription_service.dto.PatientResponseDTO;
import org.springframework.beans.factory.annotation.Value;
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
    private final String patientServiceUrl;

    public PatientClient(RestTemplate restTemplate, @Value("${services.patient-service.url}") String patientServiceUrl) {
        this.restTemplate = restTemplate;
        this.patientServiceUrl = patientServiceUrl;
    }

    public PatientResponseDTO getPatientById(Long patientId, String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        try {
            ResponseEntity<PatientResponseDTO> response = restTemplate.exchange(
                    patientServiceUrl + "/patients/{patientId}",
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
            String message = extractMessage(ex.getResponseBodyAsString());
            throw new ResponseStatusException(
                    HttpStatus.valueOf(ex.getStatusCode().value()),
                    message
            );
        }
    }

    private String extractMessage(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            return "Patient ownership validation failed";
        }

        String marker = "\"message\":\"";
        int start = responseBody.indexOf(marker);
        if (start == -1) {
            return "Patient ownership validation failed";
        }

        int valueStart = start + marker.length();
        int valueEnd = responseBody.indexOf('"', valueStart);
        if (valueEnd == -1) {
            return "Patient ownership validation failed";
        }

        return responseBody.substring(valueStart, valueEnd);
    }
}
