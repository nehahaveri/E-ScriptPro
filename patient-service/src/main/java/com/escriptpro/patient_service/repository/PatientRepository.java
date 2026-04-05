package com.escriptpro.patient_service.repository;

import com.escriptpro.patient_service.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    List<Patient> findByDoctorId(Long doctorId);
}
