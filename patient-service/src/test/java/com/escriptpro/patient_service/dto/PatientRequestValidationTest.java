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
                170,
                68
        );

        Set<String> messages = validator.validate(request).stream()
                .map(violation -> violation.getMessage())
                .collect(java.util.stream.Collectors.toSet());

        assertEquals(Set.of("Mobile number must be exactly 10 digits"), messages);
    }
}
