package com.escriptpro.prescription_service.repository;

import com.escriptpro.prescription_service.entity.Lotion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LotionRepository extends JpaRepository<Lotion, Long> {

    List<Lotion> findByPrescriptionId(Long prescriptionId);

    void deleteByPrescriptionId(Long prescriptionId);
}

