package com.escriptpro.prescription_service.client;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class MedicineClient {

    private final RestTemplate restTemplate;
    private final String medicineServiceUrl;

    public MedicineClient(RestTemplate restTemplate, @Value("${services.medicine-service.url}") String medicineServiceUrl) {
        this.restTemplate = restTemplate;
        this.medicineServiceUrl = medicineServiceUrl;
    }

    public List<Map<String, Object>> searchMedicines(String query, String type) {
        ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                medicineServiceUrl + "/medicines/search?query={query}&type={type}",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {
                },
                query,
                type
        );

        return response.getBody();
    }

    public void registerCustomSuggestion(String type, String name) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", type);
        payload.put("name", name);

        restTemplate.exchange(
                medicineServiceUrl + "/medicines/suggestions/custom",
                HttpMethod.POST,
                new HttpEntity<>(payload),
                Void.class
        );
    }
}
