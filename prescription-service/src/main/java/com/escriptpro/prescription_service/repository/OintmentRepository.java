package com.escriptpro.prescription_service.repository;

import com.escriptpro.prescription_service.entity.Ointment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OintmentRepository extends JpaRepository<Ointment, Long> {
    List<Ointment> findByPrescriptionId(Long prescriptionId);
    void deleteByPrescriptionId(Long prescriptionId);
}

