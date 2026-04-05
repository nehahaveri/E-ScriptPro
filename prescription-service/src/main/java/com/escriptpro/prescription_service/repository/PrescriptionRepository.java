package com.escriptpro.prescription_service.repository;

import com.escriptpro.prescription_service.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
}
