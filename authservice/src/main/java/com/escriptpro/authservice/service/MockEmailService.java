package com.escriptpro.authservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class MockEmailService implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(MockEmailService.class);

    @Override
    public void sendPasswordReset(String email, String resetToken) {
        log.info("Mock password reset email queued for email={} token={}", email, resetToken);
    }
}
