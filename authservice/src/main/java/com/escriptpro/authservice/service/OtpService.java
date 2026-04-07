package com.escriptpro.authservice.service;

import com.escriptpro.authservice.entity.AuthUser;
import com.escriptpro.authservice.mfa.OtpDeliveryService;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class OtpService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final PasswordEncoder passwordEncoder;
    private final OtpDeliveryService otpDeliveryService;

    public OtpService(
            PasswordEncoder passwordEncoder,
            OtpDeliveryService otpDeliveryService) {
        this.passwordEncoder = passwordEncoder;
        this.otpDeliveryService = otpDeliveryService;
    }

    public void issueOtp(AuthUser authUser, String e164PhoneNumber) {
        String otp = generateOtp();
        authUser.setOtpCodeHash(passwordEncoder.encode(otp));
        authUser.setOtpExpiresAt(LocalDateTime.now().plusMinutes(5));
        otpDeliveryService.sendOtp(e164PhoneNumber, otp);
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
