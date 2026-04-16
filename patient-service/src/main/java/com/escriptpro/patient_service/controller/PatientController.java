package com.escriptpro.patient_service.controller;

import com.escriptpro.patient_service.dto.PatientAppointmentDTO;
import com.escriptpro.patient_service.dto.PatientRequest;
import com.escriptpro.patient_service.entity.Patient;
import com.escriptpro.patient_service.service.PatientService;
import com.escriptpro.patient_service.util.JwtUtil;
import jakarta.validation.Valid;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
        String role = jwtUtil.extractRole(token);
        assertDoctorOrReceptionist(role);
        Long doctorId = jwtUtil.extractDoctorId(token);

        Patient patient = new Patient();
        patient.setName(patientRequest.getName().trim());
        patient.setAge(patientRequest.getAge());
        patient.setGender(patientRequest.getGender().trim());
        patient.setMobile(patientRequest.getMobile().trim());
        patient.setAddress(patientRequest.getAddress() == null ? null : patientRequest.getAddress().trim());
        patient.setAppointmentDate(patientRequest.getAppointmentDate() == null ? null : patientRequest.getAppointmentDate().trim());
        patient.setAppointmentTime(patientRequest.getAppointmentTime() == null ? null : patientRequest.getAppointmentTime().trim());
        patient.setAppointmentStatus(patientRequest.getAppointmentStatus() == null ? null : patientRequest.getAppointmentStatus().trim());
        patient.setAppointmentReminderMinutes(patientRequest.getAppointmentReminderMinutes());
        patient.setHeight(patientRequest.getHeight());
        patient.setWeight(patientRequest.getWeight());

        return patientService.savePatient(patient, email, token, role, doctorId);
    }

    @PutMapping("/{patientId}")
    public Patient updatePatient(@RequestHeader("Authorization") String authorizationHeader,
                                 @PathVariable Long patientId,
                                 @Valid @RequestBody PatientRequest patientRequest) {
        String token = extractBearerToken(authorizationHeader);
        String email = jwtUtil.extractUsername(token);
        String role = jwtUtil.extractRole(token);
        assertDoctor(role);
        Long doctorId = jwtUtil.extractDoctorId(token);

        Patient patient = new Patient();
        patient.setName(patientRequest.getName().trim());
        patient.setAge(patientRequest.getAge());
        patient.setGender(patientRequest.getGender().trim());
        patient.setMobile(patientRequest.getMobile().trim());
        patient.setAddress(patientRequest.getAddress() == null ? null : patientRequest.getAddress().trim());
        patient.setAppointmentDate(patientRequest.getAppointmentDate() == null ? null : patientRequest.getAppointmentDate().trim());
        patient.setAppointmentTime(patientRequest.getAppointmentTime() == null ? null : patientRequest.getAppointmentTime().trim());
        patient.setAppointmentStatus(patientRequest.getAppointmentStatus() == null ? null : patientRequest.getAppointmentStatus().trim());
        patient.setAppointmentReminderMinutes(patientRequest.getAppointmentReminderMinutes());
        patient.setHeight(patientRequest.getHeight());
        patient.setWeight(patientRequest.getWeight());

        return patientService.updatePatient(email, token, role, doctorId, patientId, patient);
    }

    @GetMapping
    public List<Patient> getPatients(@RequestHeader("Authorization") String authorizationHeader) {
        String token = extractBearerToken(authorizationHeader);
        String email = jwtUtil.extractUsername(token);
        String role = jwtUtil.extractRole(token);
        assertDoctorOrReceptionist(role);
        Long doctorId = jwtUtil.extractDoctorId(token);
        return patientService.getPatientsByDoctorEmail(email, token, role, doctorId);
    }

    @GetMapping("/{patientId}")
    public Patient getPatientById(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable Long patientId) {
        String token = extractBearerToken(authorizationHeader);
        String email = jwtUtil.extractUsername(token);
        String role = jwtUtil.extractRole(token);
        assertDoctorOrReceptionist(role);
        Long doctorId = jwtUtil.extractDoctorId(token);
        return patientService.getPatientByDoctorEmailAndPatientId(email, token, role, doctorId, patientId);
    }

    @GetMapping("/search")
    public List<Patient> searchPatients(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam String query) {
        String token = extractBearerToken(authorizationHeader);
        String email = jwtUtil.extractUsername(token);
        String role = jwtUtil.extractRole(token);
        assertDoctorOrReceptionist(role);
        Long doctorId = jwtUtil.extractDoctorId(token);
        return patientService.searchPatientsByDoctorEmail(email, token, role, doctorId, query);
    }

    @GetMapping("/appointments")
    public List<PatientAppointmentDTO> getAppointmentsByDate(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam String date) {
        String token = extractBearerToken(authorizationHeader);
        String email = jwtUtil.extractUsername(token);
        String role = jwtUtil.extractRole(token);
        assertDoctorOrReceptionist(role);
        Long doctorId = jwtUtil.extractDoctorId(token);
        return patientService.getAppointmentsByDoctorEmailAndDate(email, token, role, doctorId, date);
    }

    @GetMapping("/{patientId}/calendar.ics")
    public ResponseEntity<byte[]> downloadCalendarInvite(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable Long patientId) {
        String token = extractBearerToken(authorizationHeader);
        String email = jwtUtil.extractUsername(token);
        String role = jwtUtil.extractRole(token);
        assertDoctorOrReceptionist(role);
        Long doctorId = jwtUtil.extractDoctorId(token);

        String calendarInvite = patientService.buildCalendarInvite(email, token, role, doctorId, patientId);
        byte[] body = calendarInvite.getBytes(StandardCharsets.UTF_8);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/calendar; charset=UTF-8"));
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"appointment-" + patientId + ".ics\"");
        return ResponseEntity.ok()
                .headers(headers)
                .body(body);
    }

    @DeleteMapping("/{patientId}")
    public ResponseEntity<Map<String, String>> deletePatient(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable Long patientId) {
        String token = extractBearerToken(authorizationHeader);
        String email = jwtUtil.extractUsername(token);
        String role = jwtUtil.extractRole(token);
        assertDoctor(role);
        Long doctorId = jwtUtil.extractDoctorId(token);
        patientService.deletePatientByDoctorEmailAndPatientId(email, token, role, doctorId, patientId);
        return ResponseEntity.ok(Map.of("message", "Patient deleted successfully"));
    }

    private String extractBearerToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
        }
        return authorizationHeader.substring(7);
    }

    private void assertDoctorOrReceptionist(String role) {
        if (!"DOCTOR".equalsIgnoreCase(role) && !"RECEPTIONIST".equalsIgnoreCase(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }

    private void assertDoctor(String role) {
        if (!"DOCTOR".equalsIgnoreCase(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only doctors can perform this action");
        }
    }
}
