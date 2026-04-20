package com.escriptpro.pdf_service.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
public class PrescriptionClient {

    private static final Logger log = LoggerFactory.getLogger(PrescriptionClient.class);

    private final RestTemplate restTemplate;
    private final String prescriptionServiceUrl;

    public PrescriptionClient(RestTemplate restTemplate, @Value("${services.prescription-service.url}") String prescriptionServiceUrl) {
        this.restTemplate = restTemplate;
        this.prescriptionServiceUrl = prescriptionServiceUrl;
    }

    /**
     * Update prescription with PDF key after PDF generation
     */
    public void updatePrescriptionPdfKey(Long prescriptionId, String pdfKey) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);

            // Send pdfKey as request body
            String requestBody = "{\"pdfKey\":\"" + pdfKey + "\"}";
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Void> response = restTemplate.exchange(
                    prescriptionServiceUrl + "/prescriptions/{id}/update-pdf-key",
                    HttpMethod.PUT,
                    entity,
                    Void.class,
                    prescriptionId
            );

            if (response.getStatusCode() != HttpStatus.OK && response.getStatusCode() != HttpStatus.NO_CONTENT) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to update PDF key for prescription " + prescriptionId);
            }
            
            log.info("Successfully updated prescription {} with PDF key", prescriptionId);
        } catch (Exception e) {
            log.error("Error updating prescription with PDF key", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to update prescription with PDF key");
        }
    }
}
