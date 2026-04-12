package com.escriptpro.patient_service.service;

import com.escriptpro.patient_service.dto.DoctorResponseDTO;
import com.escriptpro.patient_service.dto.PatientAppointmentDTO;
import com.escriptpro.patient_service.dto.PatientEventDTO;
import com.escriptpro.patient_service.entity.Patient;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import com.escriptpro.patient_service.repository.PatientRepository;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.UUID;
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
    private static final String DEFAULT_APPOINTMENT_STATUS = "BOOKED";
    private static final int DEFAULT_APPOINTMENT_REMINDER_MINUTES = 60;
    private static final String DEFAULT_CALENDAR_PROVIDER = "NONE";
    private static final String DEFAULT_CALENDAR_SYNC_STATUS = "READY";
    private static final DateTimeFormatter ICS_TIMESTAMP_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss");

    private final PatientRepository patientRepository;
    private final RestTemplate restTemplate;
    private final KafkaProducerService kafkaProducerService;

    public PatientService(
            PatientRepository patientRepository,
            RestTemplate restTemplate,
            KafkaProducerService kafkaProducerService) {
        this.patientRepository = patientRepository;
        this.restTemplate = restTemplate;
        this.kafkaProducerService = kafkaProducerService;
    }

    public Patient savePatient(Patient patient, String email, String token, String role, Long doctorIdFromToken) {
        Long doctorId = resolveDoctorId(email, token, role, doctorIdFromToken);
        backfillMissingPatientNumbers(doctorId);
        patient.setDoctorId(doctorId);
        patient.setPatientNumber(nextPatientNumber(doctorId));
        normalizeAppointmentMetadata(patient);
        Patient savedPatient = patientRepository.save(patient);
        kafkaProducerService.sendPatientEvent(buildPatientEvent("PATIENT_CREATED", savedPatient, role, email));
        return savedPatient;
    }

    public Patient updatePatient(
            String email,
            String token,
            String role,
            Long doctorIdFromToken,
            Long patientId,
            Patient updatedPatient) {
        Long doctorId = resolveDoctorId(email, token, role, doctorIdFromToken);
        Patient existingPatient = patientRepository.findByIdAndDoctorId(patientId, doctorId)
                .orElseThrow(() -> resolvePatientAccessError(patientId));

        existingPatient.setName(updatedPatient.getName());
        existingPatient.setAge(updatedPatient.getAge());
        existingPatient.setGender(updatedPatient.getGender());
        existingPatient.setMobile(updatedPatient.getMobile());
        existingPatient.setAddress(updatedPatient.getAddress());
        existingPatient.setAppointmentDate(updatedPatient.getAppointmentDate());
        existingPatient.setAppointmentTime(updatedPatient.getAppointmentTime());
        existingPatient.setAppointmentStatus(updatedPatient.getAppointmentStatus());
        existingPatient.setAppointmentReminderMinutes(updatedPatient.getAppointmentReminderMinutes());
        existingPatient.setHeight(updatedPatient.getHeight());
        existingPatient.setWeight(updatedPatient.getWeight());
        normalizeAppointmentMetadata(existingPatient);

        Patient savedPatient = patientRepository.save(existingPatient);
        kafkaProducerService.sendPatientEvent(buildPatientEvent("PATIENT_UPDATED", savedPatient, role, email));
        return savedPatient;
    }

    public List<Patient> getPatientsByDoctorEmail(String email, String token, String role, Long doctorIdFromToken) {
        Long doctorId = resolveDoctorId(email, token, role, doctorIdFromToken);
        backfillMissingPatientNumbers(doctorId);
        return patientRepository.findByDoctorIdOrderByPatientNumberAsc(doctorId);
    }

    public Patient getPatientByDoctorEmailAndPatientId(
            String email,
            String token,
            String role,
            Long doctorIdFromToken,
            Long patientId) {
        Long doctorId = resolveDoctorId(email, token, role, doctorIdFromToken);
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

    public List<Patient> searchPatientsByDoctorEmail(
            String email,
            String token,
            String role,
            Long doctorIdFromToken,
            String query) {
        Long doctorId = resolveDoctorId(email, token, role, doctorIdFromToken);
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

    public List<PatientAppointmentDTO> getAppointmentsByDoctorEmailAndDate(
            String email,
            String token,
            String role,
            Long doctorIdFromToken,
            String date) {
        Long doctorId = resolveDoctorId(email, token, role, doctorIdFromToken);
        backfillMissingPatientNumbers(doctorId);
        return patientRepository.findByDoctorIdAndAppointmentDateOrderByPatientNumberAsc(doctorId, date).stream()
                .map(patient -> new PatientAppointmentDTO(
                        patient.getId(),
                        patient.getPatientNumber(),
                        patient.getName(),
                        patient.getMobile(),
                        patient.getAge(),
                        patient.getGender(),
                        patient.getAppointmentDate(),
                        patient.getAppointmentTime(),
                        patient.getAppointmentStatus(),
                        patient.getAppointmentReminderMinutes()
                ))
                .toList();
    }

    public String buildCalendarInvite(
            String email,
            String token,
            String role,
            Long doctorIdFromToken,
            Long patientId) {
        Patient patient = getPatientByDoctorEmailAndPatientId(email, token, role, doctorIdFromToken, patientId);
        if (patient.getAppointmentDate() == null || patient.getAppointmentDate().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Appointment date is required to export calendar invite");
        }

        LocalDate appointmentDate = LocalDate.parse(patient.getAppointmentDate());
        LocalTime appointmentTime = patient.getAppointmentTime() == null || patient.getAppointmentTime().isBlank()
                ? LocalTime.of(9, 0)
                : LocalTime.parse(patient.getAppointmentTime());
        LocalDateTime start = LocalDateTime.of(appointmentDate, appointmentTime);
        LocalDateTime end = start.plusMinutes(30);
        String stamp = LocalDateTime.now().format(ICS_TIMESTAMP_FORMAT);
        String uid = patient.getExternalCalendarEventId() != null && !patient.getExternalCalendarEventId().isBlank()
                ? patient.getExternalCalendarEventId()
                : patient.getId() + "-" + UUID.randomUUID() + "@escriptpro";
        int reminderMinutes = patient.getAppointmentReminderMinutes() == null
                ? DEFAULT_APPOINTMENT_REMINDER_MINUTES
                : patient.getAppointmentReminderMinutes();

        return String.join("\r\n",
                "BEGIN:VCALENDAR",
                "VERSION:2.0",
                "PRODID:-//E-ScriptPro//Appointments//EN",
                "CALSCALE:GREGORIAN",
                "METHOD:PUBLISH",
                "BEGIN:VEVENT",
                "UID:" + escapeIcs(uid),
                "DTSTAMP:" + stamp,
                "DTSTART:" + start.format(ICS_TIMESTAMP_FORMAT),
                "DTEND:" + end.format(ICS_TIMESTAMP_FORMAT),
                "SUMMARY:" + escapeIcs("Appointment - " + patient.getName()),
                "DESCRIPTION:" + escapeIcs(buildCalendarDescription(patient)),
                "STATUS:CONFIRMED",
                "BEGIN:VALARM",
                "ACTION:DISPLAY",
                "DESCRIPTION:" + escapeIcs("Upcoming appointment for " + patient.getName()),
                "TRIGGER:-PT" + reminderMinutes + "M",
                "END:VALARM",
                "END:VEVENT",
                "END:VCALENDAR",
                "");
    }

    public void deletePatientByDoctorEmailAndPatientId(
            String email,
            String token,
            String role,
            Long doctorIdFromToken,
            Long patientId) {
        Long doctorId = resolveDoctorId(email, token, role, doctorIdFromToken);
        backfillMissingPatientNumbers(doctorId);
        Patient patient = patientRepository.findByIdAndDoctorId(patientId, doctorId)
                .orElseThrow(() -> resolvePatientAccessError(patientId));

        deletePrescriptionHistory(patient.getId(), token);
        patientRepository.delete(patient);
        kafkaProducerService.sendPatientEvent(buildPatientEvent("PATIENT_DELETED", patient, role, email));
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

    private Long resolveDoctorId(String email, String token, String role, Long doctorIdFromToken) {
        if ("RECEPTIONIST".equalsIgnoreCase(role)) {
            if (doctorIdFromToken == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Doctor context missing in token");
            }
            return doctorIdFromToken;
        }
        return fetchDoctorIdByEmail(email, token);
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

    private void normalizeAppointmentMetadata(Patient patient) {
        if (patient.getAppointmentDate() == null || patient.getAppointmentDate().isBlank()) {
            patient.setAppointmentTime(null);
            patient.setAppointmentStatus(null);
            patient.setAppointmentReminderMinutes(null);
            patient.setCalendarProvider(DEFAULT_CALENDAR_PROVIDER);
            patient.setCalendarSyncStatus(DEFAULT_CALENDAR_SYNC_STATUS);
            patient.setExternalCalendarEventId(null);
            return;
        }

        patient.setAppointmentStatus(
                patient.getAppointmentStatus() == null || patient.getAppointmentStatus().isBlank()
                        ? DEFAULT_APPOINTMENT_STATUS
                        : patient.getAppointmentStatus().trim()
        );
        patient.setAppointmentReminderMinutes(
                patient.getAppointmentReminderMinutes() == null
                        ? DEFAULT_APPOINTMENT_REMINDER_MINUTES
                        : patient.getAppointmentReminderMinutes()
        );
        patient.setCalendarProvider(DEFAULT_CALENDAR_PROVIDER);
        patient.setCalendarSyncStatus(DEFAULT_CALENDAR_SYNC_STATUS);
        patient.setExternalCalendarEventId(
                patient.getExternalCalendarEventId() == null || patient.getExternalCalendarEventId().isBlank()
                        ? patient.getExternalCalendarEventId()
                        : patient.getExternalCalendarEventId().trim()
        );
    }

    private String buildCalendarDescription(Patient patient) {
        List<String> lines = new ArrayList<>();
        lines.add("Patient: " + patient.getName());
        if (patient.getPatientNumber() != null) {
            lines.add("Patient ID: " + patient.getPatientNumber());
        }
        if (patient.getMobile() != null && !patient.getMobile().isBlank()) {
            lines.add("Mobile: " + patient.getMobile());
        }
        if (patient.getAppointmentStatus() != null && !patient.getAppointmentStatus().isBlank()) {
            lines.add("Status: " + patient.getAppointmentStatus());
        }
        if (patient.getAppointmentReminderMinutes() != null) {
            lines.add("Reminder: " + patient.getAppointmentReminderMinutes() + " minute(s) before");
        }
        return String.join("\\n", lines);
    }

    private String escapeIcs(String value) {
        return value
                .replace("\\", "\\\\")
                .replace(";", "\\;")
                .replace(",", "\\,")
                .replace("\n", "\\n");
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
            if (patient.getPatientNumber() == null || !patient.getPatientNumber().equals(nextNumber)) {
                patient.setPatientNumber(nextNumber);
                changed = true;
            }
            nextNumber += 1;
        }

        if (changed) {
            patientRepository.saveAll(patients);
        }
    }

    private PatientEventDTO buildPatientEvent(String eventType, Patient patient, String role, String email) {
        return new PatientEventDTO(
                eventType,
                patient.getId(),
                patient.getPatientNumber(),
                patient.getDoctorId(),
                role,
                email,
                patient.getName(),
                patient.getMobile(),
                patient.getAppointmentDate(),
                patient.getAppointmentTime(),
                patient.getAppointmentStatus()
        );
    }
}
