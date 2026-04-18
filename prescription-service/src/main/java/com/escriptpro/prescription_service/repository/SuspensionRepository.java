package com.escriptpro.prescription_service.repository;

import com.escriptpro.prescription_service.entity.Suspension;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SuspensionRepository extends JpaRepository<Suspension, Long> {
    List<Suspension> findByPrescriptionId(Long prescriptionId);
    void deleteByPrescriptionId(Long prescriptionId);
}

