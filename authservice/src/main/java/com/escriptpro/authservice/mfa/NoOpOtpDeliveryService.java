package com.escriptpro.authservice.mfa;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class NoOpOtpDeliveryService implements OtpDeliveryService {

    private static final Logger log = LoggerFactory.getLogger(NoOpOtpDeliveryService.class);

    @Override
    public void sendOtp(String e164PhoneNumber, String code) {
        log.info("MFA delivery is not configured. OTP requested for phone={} code={}", e164PhoneNumber, code);
    }
}
