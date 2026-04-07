package com.escriptpro.authservice.mfa;

public interface OtpDeliveryService {

    void sendOtp(String e164PhoneNumber, String code);
}
