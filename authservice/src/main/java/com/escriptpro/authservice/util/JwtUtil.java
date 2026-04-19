package com.escriptpro.authservice.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.MacAlgorithm;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    private static final String DEFAULT_SECRET =
            "escriptpro-authservice-jwt-secret-key-for-development-only-2026-escriptpro-secure";
    private static final long ACCESS_TOKEN_EXPIRATION = 1000L * 60 * 15; // 15 minutes
    private static final long REFRESH_TOKEN_EXPIRATION_DAYS = 7;
    private static final MacAlgorithm SIGNATURE_ALGORITHM = Jwts.SIG.HS512;

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

    public String generateToken(String email, Long doctorId, String role) {
        var builder = Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRATION))
                .signWith(key, SIGNATURE_ALGORITHM);

        if (doctorId != null) {
            builder.claim("doctorId", doctorId);
        }

        return builder.compact();
    }

    public String generateServiceToken(String subject) {
        return Jwts.builder()
                .subject(subject)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRATION))
                .signWith(key, SIGNATURE_ALGORITHM)
                .compact();
    }

    public long getRefreshTokenExpirationDays() {
        return REFRESH_TOKEN_EXPIRATION_DAYS;
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
        } catch (Exception exception) {
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
