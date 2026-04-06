package com.escriptpro.patient_service.repository;

import com.escriptpro.patient_service.entity.Patient;
import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    List<Patient> findByDoctorId(Long doctorId);

    Optional<Patient> findByIdAndDoctorId(Long id, Long doctorId);

    @Query("""
            SELECT p
            FROM Patient p
            WHERE p.doctorId = :doctorId
              AND (
                    LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%'))
                    OR LOWER(p.mobile) LIKE LOWER(CONCAT('%', :query, '%'))
                  )
            ORDER BY p.name ASC
            """)
    List<Patient> searchByDoctorId(@Param("doctorId") Long doctorId, @Param("query") String query);
}
