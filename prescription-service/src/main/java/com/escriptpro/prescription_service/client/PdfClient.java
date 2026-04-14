package com.escriptpro.prescription_service.client;

import com.escriptpro.prescription_service.dto.PrescriptionRequestDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class PdfClient {

    private final RestTemplate restTemplate;
    private final String pdfServiceUrl;

    public PdfClient(RestTemplate restTemplate, @Value("${services.pdf-service.url}") String pdfServiceUrl) {
        this.restTemplate = restTemplate;
        this.pdfServiceUrl = pdfServiceUrl;
    }

    public byte[] generatePdf(PrescriptionRequestDTO request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<PrescriptionRequestDTO> entity = new HttpEntity<>(request, headers);
        return restTemplate.postForObject(pdfServiceUrl + "/pdf/generate", entity, byte[].class);
    }
}
