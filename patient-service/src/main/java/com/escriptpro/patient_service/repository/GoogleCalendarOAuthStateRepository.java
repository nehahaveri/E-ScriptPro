package com.escriptpro.patient_service.repository;

import com.escriptpro.patient_service.entity.GoogleCalendarOAuthState;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoogleCalendarOAuthStateRepository extends JpaRepository<GoogleCalendarOAuthState, Long> {

    Optional<GoogleCalendarOAuthState> findByStateToken(String stateToken);

    void deleteByExpiresAtBefore(LocalDateTime cutoff);
}
