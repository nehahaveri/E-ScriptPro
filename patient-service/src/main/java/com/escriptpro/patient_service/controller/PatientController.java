package com.escriptpro.patient_service.controller;

import com.escriptpro.patient_service.dto.PatientRequest;
import com.escriptpro.patient_service.entity.Patient;
import com.escriptpro.patient_service.service.PatientService;
import com.escriptpro.patient_service.util.JwtUtil;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
                               @RequestBody PatientRequest patientRequest) {
        String token = authorizationHeader.substring(7);
        String email = jwtUtil.extractUsername(token);
        System.out.println("Extracted email from JWT: " + email);

        Patient patient = new Patient();
        patient.setName(patientRequest.getName());
        patient.setAge(patientRequest.getAge());
        patient.setGender(patientRequest.getGender());
        patient.setMobile(patientRequest.getMobile());

        return patientService.savePatient(patient, email, token);
    }

    @GetMapping
    public List<Patient> getPatients(@RequestHeader("Authorization") String authorizationHeader) {
        String token = authorizationHeader.substring(7);
        String email = jwtUtil.extractUsername(token);
        return patientService.getPatientsByDoctorEmail(email, token);
    }

    @GetMapping("/{doctorId}")
    public List<Patient> getPatientsByDoctorId(@PathVariable Long doctorId) {
        return patientService.getPatientsByDoctorId(doctorId);
    }
}
