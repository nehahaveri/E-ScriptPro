package com.escriptpro.authservice.client;

import com.escriptpro.authservice.dto.DoctorAuthProfileDTO;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
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
    private final String doctorServiceUrl;

    public DoctorClient(RestTemplate restTemplate, @Value("${services.doctor-service.url}") String doctorServiceUrl) {
        this.restTemplate = restTemplate;
        this.doctorServiceUrl = doctorServiceUrl;
    }

    public DoctorAuthProfileDTO createDoctorProfile(String email, String name, String phone, String token) {
        Map<String, Object> body = new HashMap<>();
        body.put("email", email);
        body.put("name", name);
        body.put("phone", phone);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        return restTemplate.postForObject(doctorServiceUrl + "/doctors", request, DoctorAuthProfileDTO.class);
    }

    public String getDoctorEmailByPhone(String phone, String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        HttpEntity<Void> request = new HttpEntity<>(headers);
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                doctorServiceUrl + "/doctors/phone/{phone}",
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

    public DoctorAuthProfileDTO getDoctorProfileByEmail(String email, String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        HttpEntity<Void> request = new HttpEntity<>(headers);
        ResponseEntity<DoctorAuthProfileDTO> response = restTemplate.exchange(
                doctorServiceUrl + "/doctors/email/{email}",
                HttpMethod.GET,
                request,
                DoctorAuthProfileDTO.class,
                email
        );

        return response.getBody();
    }

    public DoctorAuthProfileDTO getDoctorProfileByPhone(String phone, String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        HttpEntity<Void> request = new HttpEntity<>(headers);
        ResponseEntity<DoctorAuthProfileDTO> response = restTemplate.exchange(
                doctorServiceUrl + "/doctors/phone/{phone}",
                HttpMethod.GET,
                request,
                DoctorAuthProfileDTO.class,
                phone
        );

        return response.getBody();
    }

    public DoctorAuthProfileDTO getDoctorProfileById(Long doctorId, String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        HttpEntity<Void> request = new HttpEntity<>(headers);
        ResponseEntity<DoctorAuthProfileDTO> response = restTemplate.exchange(
                doctorServiceUrl + "/doctors/{doctorId}",
                HttpMethod.GET,
                request,
                DoctorAuthProfileDTO.class,
                doctorId
        );

        return response.getBody();
    }
}
