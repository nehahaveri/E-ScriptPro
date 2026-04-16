package com.escriptpro.patient_service.repository;

import com.escriptpro.patient_service.entity.GoogleCalendarConnection;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoogleCalendarConnectionRepository extends JpaRepository<GoogleCalendarConnection, Long> {

    Optional<GoogleCalendarConnection> findByDoctorId(Long doctorId);
}
