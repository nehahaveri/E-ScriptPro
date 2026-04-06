package com.escriptpro.patient_service.service;

import com.escriptpro.patient_service.dto.DoctorResponseDTO;
import com.escriptpro.patient_service.entity.Patient;
import com.escriptpro.patient_service.repository.PatientRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.client.RestTemplate;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final RestTemplate restTemplate;

    public PatientService(PatientRepository patientRepository, RestTemplate restTemplate) {
        this.patientRepository = patientRepository;
        this.restTemplate = restTemplate;
    }

    public Patient savePatient(Patient patient, String email, String token) {
        Long doctorId = fetchDoctorIdByEmail(email, token);
        patient.setDoctorId(doctorId);
        return patientRepository.save(patient);
    }

    public List<Patient> getPatientsByDoctorEmail(String email, String token) {
        Long doctorId = fetchDoctorIdByEmail(email, token);
        return patientRepository.findByDoctorId(doctorId);
    }

    public Patient getPatientByDoctorEmailAndPatientId(String email, String token, Long patientId) {
        Long doctorId = fetchDoctorIdByEmail(email, token);
        Optional<Patient> ownedPatient = patientRepository.findByIdAndDoctorId(patientId, doctorId);
        if (ownedPatient.isPresent()) {
            return ownedPatient.get();
        }

        if (patientRepository.existsById(patientId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Patient does not belong to this doctor");
        }

        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found");
    }

    public List<Patient> searchPatientsByDoctorEmail(String email, String token, String query) {
        Long doctorId = fetchDoctorIdByEmail(email, token);
        String normalized = query == null ? "" : query.trim();
        if (normalized.isEmpty()) {
            return patientRepository.findByDoctorId(doctorId);
        }
        return patientRepository.searchByDoctorId(doctorId, normalized);
    }

    private Long fetchDoctorIdByEmail(String email, String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        ResponseEntity<DoctorResponseDTO> response = restTemplate.exchange(
                "http://localhost:8086/doctors/email/{email}",
                HttpMethod.GET,
                entity,
                DoctorResponseDTO.class,
                email
        );
        DoctorResponseDTO doctorResponse = response.getBody();

        if (doctorResponse == null || doctorResponse.getId() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found for email: " + email);
        }

        return doctorResponse.getId();
    }
}
