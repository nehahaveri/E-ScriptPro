package com.escriptpro.authservice.validation;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class PhoneNumberValidatorTest {

    @Test
    void convertsIndianPhoneNumbersToE164ByDefault() {
        assertEquals("+919876543210", PhoneNumberValidator.toE164("9876543210", "IN"));
    }

    @Test
    void rejectsInvalidIndianPhoneNumbers() {
        assertThrows(IllegalArgumentException.class, () -> PhoneNumberValidator.toE164("12345", "IN"));
    }
}
