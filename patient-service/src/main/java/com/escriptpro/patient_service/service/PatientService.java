package com.escriptpro.patient_service.service;

import com.escriptpro.patient_service.dto.DoctorResponseDTO;
import com.escriptpro.patient_service.entity.Patient;
import java.util.LinkedHashMap;
import com.escriptpro.patient_service.repository.PatientRepository;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.client.HttpStatusCodeException;
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
        backfillMissingPatientNumbers(doctorId);
        patient.setDoctorId(doctorId);
        patient.setPatientNumber(nextPatientNumber(doctorId));
        return patientRepository.save(patient);
    }

    public Patient updatePatient(String email, String token, Long patientId, Patient updatedPatient) {
        Long doctorId = fetchDoctorIdByEmail(email, token);
        Patient existingPatient = patientRepository.findByIdAndDoctorId(patientId, doctorId)
                .orElseThrow(() -> resolvePatientAccessError(patientId));

        existingPatient.setName(updatedPatient.getName());
        existingPatient.setAge(updatedPatient.getAge());
        existingPatient.setGender(updatedPatient.getGender());
        existingPatient.setMobile(updatedPatient.getMobile());
        existingPatient.setAddress(updatedPatient.getAddress());
        existingPatient.setHeight(updatedPatient.getHeight());
        existingPatient.setWeight(updatedPatient.getWeight());

        return patientRepository.save(existingPatient);
    }

    public List<Patient> getPatientsByDoctorEmail(String email, String token) {
        Long doctorId = fetchDoctorIdByEmail(email, token);
        backfillMissingPatientNumbers(doctorId);
        return patientRepository.findByDoctorIdOrderByPatientNumberAsc(doctorId);
    }

    public Patient getPatientByDoctorEmailAndPatientId(String email, String token, Long patientId) {
        Long doctorId = fetchDoctorIdByEmail(email, token);
        backfillMissingPatientNumbers(doctorId);
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
        backfillMissingPatientNumbers(doctorId);
        String normalized = query == null ? "" : query.trim();
        if (normalized.isEmpty()) {
            return patientRepository.findByDoctorIdOrderByPatientNumberAsc(doctorId);
        }

        LinkedHashMap<Long, Patient> matches = new LinkedHashMap<>();

        if (normalized.matches("\\d+")) {
            long patientNumber = Long.parseLong(normalized);
            patientRepository.findByPatientNumberAndDoctorId(patientNumber, doctorId)
                    .ifPresent(patient -> matches.put(patient.getId(), patient));
        }

        patientRepository.searchByDoctorId(doctorId, normalized)
                .forEach(patient -> matches.put(patient.getId(), patient));

        return new ArrayList<>(matches.values());
    }

    public void deletePatientByDoctorEmailAndPatientId(String email, String token, Long patientId) {
        Long doctorId = fetchDoctorIdByEmail(email, token);
        backfillMissingPatientNumbers(doctorId);
        Patient patient = patientRepository.findByIdAndDoctorId(patientId, doctorId)
                .orElseThrow(() -> resolvePatientAccessError(patientId));

        deletePrescriptionHistory(patient.getId(), token);
        patientRepository.delete(patient);
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

    private void deletePrescriptionHistory(Long patientId, String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        try {
            restTemplate.exchange(
                    "http://localhost:8083/prescriptions/patient/{patientId}",
                    HttpMethod.DELETE,
                    entity,
                    Void.class,
                    patientId
            );
        } catch (HttpStatusCodeException ex) {
            throw new ResponseStatusException(
                    HttpStatus.valueOf(ex.getStatusCode().value()),
                    extractMessage(ex.getResponseBodyAsString(), "Failed to delete patient prescription history")
            );
        }
    }

    private ResponseStatusException resolvePatientAccessError(Long patientId) {
        if (patientRepository.existsById(patientId)) {
            return new ResponseStatusException(HttpStatus.FORBIDDEN, "Patient does not belong to this doctor");
        }
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found");
    }

    private String extractMessage(String responseBody, String fallback) {
        if (responseBody == null || responseBody.isBlank()) {
            return fallback;
        }

        Matcher matcher = Pattern.compile("\"message\":\"([^\"]+)\"").matcher(responseBody);
        return matcher.find() ? matcher.group(1) : fallback;
    }

    private Long nextPatientNumber(Long doctorId) {
        return patientRepository.findTopByDoctorIdOrderByPatientNumberDesc(doctorId)
                .map(patient -> (patient.getPatientNumber() == null ? 0L : patient.getPatientNumber()) + 1)
                .orElse(1L);
    }

    private void backfillMissingPatientNumbers(Long doctorId) {
        List<Patient> patients = patientRepository.findByDoctorIdOrderByIdAsc(doctorId);
        long nextNumber = 1L;
        boolean changed = false;

        for (Patient patient : patients) {
            if (patient.getPatientNumber() == null || patient.getPatientNumber() < nextNumber) {
                patient.setPatientNumber(nextNumber);
                changed = true;
            }
            nextNumber = Math.max(nextNumber, patient.getPatientNumber() + 1);
        }

        if (changed) {
            patientRepository.saveAll(patients);
        }
    }
}
