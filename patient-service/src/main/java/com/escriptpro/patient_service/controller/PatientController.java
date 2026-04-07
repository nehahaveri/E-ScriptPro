package com.escriptpro.patient_service.controller;

import com.escriptpro.patient_service.dto.PatientRequest;
import com.escriptpro.patient_service.entity.Patient;
import com.escriptpro.patient_service.service.PatientService;
import com.escriptpro.patient_service.util.JwtUtil;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/patients")
public class PatientController {

    private final PatientService patientService;
    private final JwtUtil jwtUtil;

    public PatientController(PatientService patientService, JwtUtil jwtUtil) {
        this.patientService = patientService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public Patient savePatient(@RequestHeader("Authorization") String authorizationHeader,
                               @Valid @RequestBody PatientRequest patientRequest) {
        String token = extractBearerToken(authorizationHeader);
        String email = jwtUtil.extractUsername(token);

        Patient patient = new Patient();
        patient.setName(patientRequest.getName().trim());
        patient.setAge(patientRequest.getAge());
        patient.setGender(patientRequest.getGender().trim());
        patient.setMobile(patientRequest.getMobile().trim());
        patient.setAddress(patientRequest.getAddress() == null ? null : patientRequest.getAddress().trim());
        patient.setHeight(patientRequest.getHeight());
        patient.setWeight(patientRequest.getWeight());

        return patientService.savePatient(patient, email, token);
    }

    @PutMapping("/{patientId}")
    public Patient updatePatient(@RequestHeader("Authorization") String authorizationHeader,
                                 @PathVariable Long patientId,
                                 @Valid @RequestBody PatientRequest patientRequest) {
        String token = extractBearerToken(authorizationHeader);
        String email = jwtUtil.extractUsername(token);

        Patient patient = new Patient();
        patient.setName(patientRequest.getName().trim());
        patient.setAge(patientRequest.getAge());
        patient.setGender(patientRequest.getGender().trim());
        patient.setMobile(patientRequest.getMobile().trim());
        patient.setAddress(patientRequest.getAddress() == null ? null : patientRequest.getAddress().trim());
        patient.setHeight(patientRequest.getHeight());
        patient.setWeight(patientRequest.getWeight());

        return patientService.updatePatient(email, token, patientId, patient);
    }

    @GetMapping
    public List<Patient> getPatients(@RequestHeader("Authorization") String authorizationHeader) {
        String token = extractBearerToken(authorizationHeader);
        String email = jwtUtil.extractUsername(token);
        return patientService.getPatientsByDoctorEmail(email, token);
    }

    @GetMapping("/{patientId}")
    public Patient getPatientById(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable Long patientId) {
        String token = extractBearerToken(authorizationHeader);
        String email = jwtUtil.extractUsername(token);
        return patientService.getPatientByDoctorEmailAndPatientId(email, token, patientId);
    }

    @GetMapping("/search")
    public List<Patient> searchPatients(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam String query) {
        String token = extractBearerToken(authorizationHeader);
        String email = jwtUtil.extractUsername(token);
        return patientService.searchPatientsByDoctorEmail(email, token, query);
    }

    @DeleteMapping("/{patientId}")
    public ResponseEntity<Map<String, String>> deletePatient(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable Long patientId) {
        String token = extractBearerToken(authorizationHeader);
        String email = jwtUtil.extractUsername(token);
        patientService.deletePatientByDoctorEmailAndPatientId(email, token, patientId);
        return ResponseEntity.ok(Map.of("message", "Patient deleted successfully"));
    }

    private String extractBearerToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
        }
        return authorizationHeader.substring(7);
    }
}
