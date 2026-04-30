package com.escriptpro.authservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.Map;

@Service
@ConditionalOnProperty(name = "resend.api-key")
public class ResendEmailService implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(ResendEmailService.class);
    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    @Value("${resend.api-key}")
    private String apiKey;

    @Value("${resend.from-email:noreply@escriptpro.nehahaveri.in}")
    private String fromEmail;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public void sendOtpEmail(String email, String otp) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = Map.of(
                "from", fromEmail,
                "to", List.of(email),
                "subject", "Your E-ScriptPro Verification Code",
                "html", """
                    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e2e8f0;border-radius:12px;">
                        <h2 style="color:#1e40af;">E-ScriptPro</h2>
                        <p>Your verification code is:</p>
                        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1e40af;padding:16px 0;">%s</div>
                        <p style="color:#64748b;font-size:14px;">This code expires in 5 minutes. Do not share it with anyone.</p>
                    </div>
                    """.formatted(otp)
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(RESEND_API_URL, request, String.class);
            log.info("OTP email sent to {} via Resend, status={}", email, response.getStatusCode());
        } catch (Exception e) {
            log.error("Failed to send OTP email to {} via Resend: {}", email, e.getMessage());
            throw new RuntimeException("Failed to send OTP email");
        }
    }

    @Override
    public void sendPasswordReset(String email, String resetToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = Map.of(
                "from", fromEmail,
                "to", List.of(email),
                "subject", "Reset your E-ScriptPro password",
                "html", """
                    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e2e8f0;border-radius:12px;">
                        <h2 style="color:#1e40af;">E-ScriptPro</h2>
                        <p>Your password reset code is:</p>
                        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1e40af;padding:16px 0;">%s</div>
                        <p style="color:#64748b;font-size:14px;">This code expires in 15 minutes. Do not share it with anyone.</p>
                    </div>
                    """.formatted(resetToken)
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(RESEND_API_URL, request, String.class);
            log.info("Password reset email sent to {} via Resend, status={}", email, response.getStatusCode());
        } catch (Exception e) {
            log.error("Failed to send password reset email to {} via Resend: {}", email, e.getMessage());
            throw new RuntimeException("Failed to send password reset email");
        }
    }
}
