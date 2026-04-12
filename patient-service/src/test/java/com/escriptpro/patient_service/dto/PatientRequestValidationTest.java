package com.escriptpro.patient_service.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class PatientRequestValidationTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    void acceptsTenDigitIndianMobileNumber() {
        PatientRequest request = new PatientRequest(
                "Patient Name",
                34,
                "Female",
                "9876543210",
                "Address",
                "2026-04-20",
                "10:30",
                "BOOKED",
                60,
                170,
                68
        );

        assertTrue(validator.validate(request).isEmpty());
    }

    @Test
    void rejectsMobileNumberThatIsNotExactlyTenDigits() {
        PatientRequest request = new PatientRequest(
                "Patient Name",
                34,
                "Female",
                "98765",
                "Address",
                "2026-04-20",
                "10:30",
                "BOOKED",
                60,
                170,
                68
        );

        Set<String> messages = validator.validate(request).stream()
                .map(violation -> violation.getMessage())
                .collect(java.util.stream.Collectors.toSet());

        assertEquals(Set.of("Mobile number must be exactly 10 digits"), messages);
    }

    @Test
    void rejectsAppointmentDateWithInvalidFormat() {
        PatientRequest request = new PatientRequest(
                "Patient Name",
                34,
                "Female",
                "9876543210",
                "Address",
                "20-04-2026",
                "10:30",
                "BOOKED",
                60,
                170,
                68
        );

        Set<String> messages = validator.validate(request).stream()
                .map(violation -> violation.getMessage())
                .collect(java.util.stream.Collectors.toSet());

        assertEquals(Set.of("Appointment date must be in YYYY-MM-DD format"), messages);
    }

    @Test
    void rejectsAppointmentTimeWithInvalidFormat() {
        PatientRequest request = new PatientRequest(
                "Patient Name",
                34,
                "Female",
                "9876543210",
                "Address",
                "2026-04-20",
                "25:61",
                "BOOKED",
                60,
                170,
                68
        );

        Set<String> messages = validator.validate(request).stream()
                .map(violation -> violation.getMessage())
                .collect(java.util.stream.Collectors.toSet());

        assertEquals(Set.of("Appointment time must be in HH:MM format"), messages);
    }

    @Test
    void rejectsAppointmentStatusOutsideAllowedValues() {
        PatientRequest request = new PatientRequest(
                "Patient Name",
                34,
                "Female",
                "9876543210",
                "Address",
                "2026-04-20",
                "10:30",
                "PLANNED",
                60,
                170,
                68
        );

        Set<String> messages = validator.validate(request).stream()
                .map(violation -> violation.getMessage())
                .collect(java.util.stream.Collectors.toSet());

        assertEquals(Set.of("Appointment status must be one of BOOKED, CONFIRMED, COMPLETED, CANCELLED, or NO_SHOW"), messages);
    }
}
