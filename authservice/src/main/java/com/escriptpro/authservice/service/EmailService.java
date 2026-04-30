package com.escriptpro.authservice.service;

public interface EmailService {

    void sendPasswordReset(String email, String resetToken);

    void sendOtpEmail(String email, String otp);
}
