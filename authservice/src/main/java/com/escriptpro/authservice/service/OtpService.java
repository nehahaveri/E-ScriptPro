package com.escriptpro.authservice.service;

import com.escriptpro.authservice.entity.AuthUser;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class OtpService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public OtpService(
            PasswordEncoder passwordEncoder,
            EmailService emailService) {
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public void issueOtp(AuthUser authUser, String email) {
        String otp = generateOtp();
        authUser.setOtpCodeHash(passwordEncoder.encode(otp));
        authUser.setOtpExpiresAt(LocalDateTime.now().plusMinutes(5));
        emailService.sendOtpEmail(email, otp);
    }

    public boolean verifyOtp(AuthUser authUser, String otp) {
        return authUser.getOtpCodeHash() != null
                && authUser.getOtpExpiresAt() != null
                && authUser.getOtpExpiresAt().isAfter(LocalDateTime.now())
                && passwordEncoder.matches(otp, authUser.getOtpCodeHash());
    }

    public void clearOtp(AuthUser authUser) {
        authUser.setOtpCodeHash(null);
        authUser.setOtpExpiresAt(null);
        authUser.setMfaChallengeToken(null);
        authUser.setMfaChallengeExpiresAt(null);
    }

    private String generateOtp() {
        int value = SECURE_RANDOM.nextInt(1_000_000);
        return String.format("%06d", value);
    }
}
