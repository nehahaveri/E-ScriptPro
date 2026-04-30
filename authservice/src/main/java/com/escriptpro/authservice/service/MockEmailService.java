package com.escriptpro.authservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnMissingBean(ResendEmailService.class)
public class MockEmailService implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(MockEmailService.class);

    @Override
    public void sendPasswordReset(String email, String resetToken) {
        log.info("Mock password reset email queued for email={} token={}", email, resetToken);
    }

    @Override
    public void sendOtpEmail(String email, String otp) {
        log.info("OTP email sent to email={} otp={}", email, otp);
    }
}
