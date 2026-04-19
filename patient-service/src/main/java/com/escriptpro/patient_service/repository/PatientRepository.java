package com.escriptpro.patient_service.repository;

import com.escriptpro.patient_service.entity.Patient;
import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    List<Patient> findByDoctorId(Long doctorId);

    List<Patient> findByDoctorIdOrderByIdAsc(Long doctorId);

    List<Patient> findByDoctorIdOrderByPatientNumberAsc(Long doctorId);

    Optional<Patient> findByIdAndDoctorId(Long id, Long doctorId);

    Optional<Patient> findByPatientNumberAndDoctorId(Long patientNumber, Long doctorId);

    Optional<Patient> findTopByDoctorIdOrderByPatientNumberDesc(Long doctorId);

    List<Patient> findByDoctorIdAndAppointmentDateOrderByPatientNumberAsc(Long doctorId, String appointmentDate);

    @Query("""
            SELECT p
            FROM Patient p
            WHERE p.doctorId = :doctorId
              AND (
                    STR(p.patientNumber) LIKE CONCAT('%', :query, '%')
                    OR
                    LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%'))
                    OR LOWER(p.mobile) LIKE LOWER(CONCAT('%', :query, '%'))
                  )
            ORDER BY p.patientNumber ASC, p.name ASC
            """)
    List<Patient> searchByDoctorId(@Param("doctorId") Long doctorId, @Param("query") String query);

    @Query("SELECT DISTINCT p.doctorId FROM Patient p")
    List<Long> findDistinctDoctorIds();
}
