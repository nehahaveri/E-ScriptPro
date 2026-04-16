package com.escriptpro.prescription_service.repository;

import com.escriptpro.prescription_service.entity.Prescription;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    List<Prescription> findByDoctorIdAndPatientIdOrderByVisitDateDescCreatedAtDesc(Long doctorId, Long patientId);

    List<Prescription> findByDoctorIdAndPatientId(Long doctorId, Long patientId);

    List<Prescription> findByDoctorIdAndFollowUpDateOrderByCreatedAtAsc(Long doctorId, String followUpDate);

    Optional<Prescription> findByIdAndDoctorId(Long id, Long doctorId);
}
