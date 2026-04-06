package com.escriptpro.prescription_service.client;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class MedicineClient {

    private final RestTemplate restTemplate;

    public MedicineClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<Map<String, Object>> searchMedicines(String query, String type) {
        ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                "http://localhost:8084/medicines/search?query={query}&type={type}",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {
                },
                query,
                type
        );

        return response.getBody();
    }

    public void registerCustomSuggestion(String type, String brand, String medicineName) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", type);
        payload.put("brand", brand);
        payload.put("medicineName", medicineName);

        restTemplate.exchange(
                "http://localhost:8084/medicines/suggestions/custom",
                HttpMethod.POST,
                new HttpEntity<>(payload),
                Void.class
        );
    }
}
