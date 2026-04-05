package com.escriptpro.patient_service.repository;

import com.escriptpro.patient_service.entity.Patient;
import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    List<Patient> findByDoctorId(Long doctorId);

    Optional<Patient> findByIdAndDoctorId(Long id, Long doctorId);
}
