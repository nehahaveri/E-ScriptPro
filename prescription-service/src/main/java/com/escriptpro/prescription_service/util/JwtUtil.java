package com.escriptpro.prescription_service.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    private static final String DEFAULT_SECRET =
            "escriptpro-authservice-jwt-secret-key-for-development-only-2026-escriptpro-secure";

    private final SecretKey key;
    private final String rawSecret;
    private final Environment environment;

    public JwtUtil(@Value("${jwt.secret:" + DEFAULT_SECRET + "}") String secret, Environment environment) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.rawSecret = secret;
        this.environment = environment;
    }

    @PostConstruct
    void warnIfDefaultSecret() {
        if (DEFAULT_SECRET.equals(rawSecret)) {
            for (String profile : environment.getActiveProfiles()) {
                if ("prod".equalsIgnoreCase(profile) || "production".equalsIgnoreCase(profile)) {
                    throw new IllegalStateException(
                            "JWT secret must be explicitly configured in production. Set 'jwt.secret' in application properties or environment.");
                }
            }
            log.warn("⚠️  Using default JWT secret. Set 'jwt.secret' before deploying to production.");
        }
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public Long extractDoctorId(String token) {
        Number doctorId = extractAllClaims(token).get("doctorId", Number.class);
        return doctorId == null ? null : doctorId.longValue();
    }

    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
