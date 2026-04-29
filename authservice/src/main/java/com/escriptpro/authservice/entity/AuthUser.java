package com.escriptpro.authservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "auth_users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.DOCTOR;

    @Column
    private Long doctorId;

    @Column(unique = true)
    private String resetToken;

    private LocalDateTime resetTokenExpiresAt;

    @Column(unique = true)
    private String mfaChallengeToken;

    private String otpCodeHash;

    private LocalDateTime otpExpiresAt;

    private LocalDateTime mfaChallengeExpiresAt;

    @Column(unique = true)
    private String signupToken;

    private LocalDateTime signupTokenExpiresAt;

    // Temporary storage during signup OTP flow
    private String pendingName;

    private String pendingPhone;

    @PrePersist
    void applyDefaults() {
        if (role == null) {
            role = Role.DOCTOR;
        }
    }
}
