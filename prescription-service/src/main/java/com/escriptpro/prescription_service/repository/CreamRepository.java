package com.escriptpro.prescription_service.repository;

import com.escriptpro.prescription_service.entity.Cream;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CreamRepository extends JpaRepository<Cream, Long> {
    List<Cream> findByPrescriptionId(Long prescriptionId);
    void deleteByPrescriptionId(Long prescriptionId);
}

