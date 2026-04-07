package com.escriptpro.doctor_service.validation;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PhoneNumberValidator implements ConstraintValidator<PhoneNumber, String> {

    private static final PhoneNumberUtil PHONE_NUMBER_UTIL = PhoneNumberUtil.getInstance();

    private String defaultRegion;
    private boolean allowBlank;

    @Override
    public void initialize(PhoneNumber constraintAnnotation) {
        this.defaultRegion = constraintAnnotation.defaultRegion();
        this.allowBlank = constraintAnnotation.allowBlank();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            return allowBlank;
        }

        try {
            var parsed = PHONE_NUMBER_UTIL.parse(value, defaultRegion);
            return PHONE_NUMBER_UTIL.isValidNumber(parsed);
        } catch (NumberParseException ex) {
            return false;
        }
    }

    public static String toE164(String value, String defaultRegion) {
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            var parsed = PHONE_NUMBER_UTIL.parse(value, defaultRegion);
            if (!PHONE_NUMBER_UTIL.isValidNumber(parsed)) {
                throw new IllegalArgumentException("Invalid phone number");
            }
            return PHONE_NUMBER_UTIL.format(parsed, PhoneNumberUtil.PhoneNumberFormat.E164);
        } catch (NumberParseException ex) {
            throw new IllegalArgumentException("Invalid phone number", ex);
        }
    }
}
