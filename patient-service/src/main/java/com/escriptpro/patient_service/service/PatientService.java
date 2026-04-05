package com.escriptpro.patient_service.service;

import com.escriptpro.patient_service.dto.DoctorResponseDTO;
import com.escriptpro.patient_service.entity.Patient;
import com.escriptpro.patient_service.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final RestTemplate restTemplate;

    public PatientService(PatientRepository patientRepository, RestTemplate restTemplate) {
        this.patientRepository = patientRepository;
        this.restTemplate = restTemplate;
    }

    public Patient savePatient(Patient patient, String email) {
        DoctorResponseDTO doctorResponse = restTemplate.getForObject(
                "http://localhost:8080/auth/doctor?email={email}",
                DoctorResponseDTO.class,
                email
        );

        if (doctorResponse == null || doctorResponse.getId() == null) {
            throw new RuntimeException("Doctor not found for email: " + email);
        }

        patient.setDoctorId(doctorResponse.getId());
        return patientRepository.save(patient);
    }

    public List<Patient> getPatientsByDoctorId(Long doctorId) {
        return patientRepository.findByDoctorId(doctorId);
    }
}
