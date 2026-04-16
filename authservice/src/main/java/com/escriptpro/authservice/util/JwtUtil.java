package com.escriptpro.authservice.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.MacAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private static final String DEFAULT_SECRET =
            "escriptpro-authservice-jwt-secret-key-for-development-only-2026-escriptpro-secure";
    private static final long EXPIRATION_TIME = 1000L * 60 * 60 * 24;
    private static final MacAlgorithm SIGNATURE_ALGORITHM = Jwts.SIG.HS512;

    private final SecretKey key;

    public JwtUtil(@Value("${jwt.secret:" + DEFAULT_SECRET + "}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String email, Long doctorId, String role) {
        var builder = Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
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
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key, SIGNATURE_ALGORITHM)
                .compact();
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
