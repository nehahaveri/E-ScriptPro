package com.escriptpro.prescription_service.repository;

import com.escriptpro.prescription_service.entity.Capsule;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CapsuleRepository extends JpaRepository<Capsule, Long> {

    List<Capsule> findByPrescriptionId(Long prescriptionId);

    void deleteByPrescriptionId(Long prescriptionId);
}

