package com.escriptpro.prescription_service.repository;

import com.escriptpro.prescription_service.entity.Gel;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GelRepository extends JpaRepository<Gel, Long> {
    List<Gel> findByPrescriptionId(Long prescriptionId);
    void deleteByPrescriptionId(Long prescriptionId);
}

