package com.escriptpro.authservice.client;

import com.escriptpro.authservice.dto.ReceptionistProfileDTO;
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
public class ReceptionistClient {

    private final RestTemplate restTemplate;
    private final String receptionistServiceUrl;

    public ReceptionistClient(RestTemplate restTemplate, @Value("${services.receptionist-service.url}") String receptionistServiceUrl) {
        this.restTemplate = restTemplate;
        this.receptionistServiceUrl = receptionistServiceUrl;
    }

    public ReceptionistProfileDTO createReceptionistProfile(String name, String email, String phone, Long doctorId) {
        Map<String, Object> body = new HashMap<>();
        body.put("name", name);
        body.put("email", email);
        body.put("phone", phone);
        body.put("doctorId", doctorId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        return restTemplate.postForObject(receptionistServiceUrl + "/receptionists", request, ReceptionistProfileDTO.class);
    }

    public ReceptionistProfileDTO getReceptionistByEmail(String email) {
        ResponseEntity<ReceptionistProfileDTO> response = restTemplate.exchange(
                receptionistServiceUrl + "/receptionists/email/{email}",
                HttpMethod.GET,
                HttpEntity.EMPTY,
                ReceptionistProfileDTO.class,
                email
        );
        return response.getBody();
    }

    public ReceptionistProfileDTO getReceptionistByPhone(String phone) {
        ResponseEntity<ReceptionistProfileDTO> response = restTemplate.exchange(
                receptionistServiceUrl + "/receptionists/phone/{phone}",
                HttpMethod.GET,
                HttpEntity.EMPTY,
                ReceptionistProfileDTO.class,
                phone
        );
        return response.getBody();
    }
}
