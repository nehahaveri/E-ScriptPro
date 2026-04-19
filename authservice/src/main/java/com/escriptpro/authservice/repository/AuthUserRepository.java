package com.escriptpro.authservice.repository;

import com.escriptpro.authservice.entity.AuthUser;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthUserRepository extends JpaRepository<AuthUser, Long> {

    Optional<AuthUser> findByEmail(String email);

    Optional<AuthUser> findByResetToken(String resetToken);

    Optional<AuthUser> findByMfaChallengeToken(String mfaChallengeToken);

    Optional<AuthUser> findByRefreshToken(String refreshToken);
}
