package com.escriptpro.authservice.client;

import java.util.HashMap;
import java.util.Map;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class DoctorClient {

    private final RestTemplate restTemplate;

    public DoctorClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void createDoctorProfile(String email, String name, String phone, String token) {
        Map<String, Object> body = new HashMap<>();
        body.put("email", email);
        body.put("name", name);
        body.put("phone", phone);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        restTemplate.postForObject("http://localhost:8086/doctors", request, Object.class);
    }

    public String getDoctorEmailByPhone(String phone, String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        HttpEntity<Void> request = new HttpEntity<>(headers);
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                "http://localhost:8086/doctors/phone/{phone}",
                HttpMethod.GET,
                request,
                new ParameterizedTypeReference<>() {},
                phone
        );

        Map<String, Object> body = response.getBody();
        if (body == null || body.get("email") == null) {
            return null;
        }
        return String.valueOf(body.get("email"));
    }
}
