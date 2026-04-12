package com.escriptpro.patient_service.controller;

import com.escriptpro.patient_service.dto.GoogleCalendarConnectResponseDTO;
import com.escriptpro.patient_service.dto.GoogleCalendarConnectionStatusDTO;
import com.escriptpro.patient_service.dto.GoogleCalendarSyncResponseDTO;
import com.escriptpro.patient_service.service.GoogleCalendarOAuthService;
import com.escriptpro.patient_service.util.JwtUtil;
import java.net.URI;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/calendar/google")
public class GoogleCalendarController {

    private final GoogleCalendarOAuthService googleCalendarOAuthService;
    private final JwtUtil jwtUtil;

    public GoogleCalendarController(GoogleCalendarOAuthService googleCalendarOAuthService, JwtUtil jwtUtil) {
        this.googleCalendarOAuthService = googleCalendarOAuthService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/connect")
    public GoogleCalendarConnectResponseDTO connect(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(required = false) String redirectUri) {
        String token = extractBearerToken(authorizationHeader);
        String email = jwtUtil.extractUsername(token);
        String role = jwtUtil.extractRole(token);
        assertDoctor(role);
        Long doctorId = jwtUtil.extractDoctorId(token);
        return googleCalendarOAuthService.buildAuthorizationUrl(email, token, role, doctorId, redirectUri);
    }

    @GetMapping("/callback")
    public ResponseEntity<Void> callback(
            @RequestParam(required = false) String code,
            @RequestParam String state,
            @RequestParam(required = false) String error) {
        String redirectTarget = googleCalendarOAuthService.handleCallback(code, state, error);
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(redirectTarget));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    @GetMapping("/status")
    public GoogleCalendarConnectionStatusDTO status(@RequestHeader("Authorization") String authorizationHeader) {
        String token = extractBearerToken(authorizationHeader);
        String email = jwtUtil.extractUsername(token);
        String role = jwtUtil.extractRole(token);
        assertDoctor(role);
        Long doctorId = jwtUtil.extractDoctorId(token);
        return googleCalendarOAuthService.getStatus(email, token, role, doctorId);
    }

    @DeleteMapping("/disconnect")
    public ResponseEntity<Map<String, String>> disconnect(@RequestHeader("Authorization") String authorizationHeader) {
        String token = extractBearerToken(authorizationHeader);
        String email = jwtUtil.extractUsername(token);
        String role = jwtUtil.extractRole(token);
        assertDoctor(role);
        Long doctorId = jwtUtil.extractDoctorId(token);
        googleCalendarOAuthService.disconnect(email, token, role, doctorId);
        return ResponseEntity.ok(Map.of("message", "Google Calendar disconnected"));
    }

    @PostMapping("/sync/patients/{patientId}")
    public GoogleCalendarSyncResponseDTO syncPatientAppointment(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable Long patientId) {
        String token = extractBearerToken(authorizationHeader);
        String email = jwtUtil.extractUsername(token);
        String role = jwtUtil.extractRole(token);
        assertDoctorOrReceptionist(role);
        Long doctorId = jwtUtil.extractDoctorId(token);
        return googleCalendarOAuthService.syncPatientAppointment(email, token, role, doctorId, patientId);
    }

    private String extractBearerToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
        }
        return authorizationHeader.substring(7);
    }

    private void assertDoctor(String role) {
        if (!"DOCTOR".equalsIgnoreCase(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only doctors can perform this action");
        }
    }

    private void assertDoctorOrReceptionist(String role) {
        if (!"DOCTOR".equalsIgnoreCase(role) && !"RECEPTIONIST".equalsIgnoreCase(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }
}
