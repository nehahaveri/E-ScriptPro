package com.escriptpro.prescription_service.repository;

import com.escriptpro.prescription_service.entity.Syrup;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SyrupRepository extends JpaRepository<Syrup, Long> {

    List<Syrup> findByPrescriptionId(Long prescriptionId);

    void deleteByPrescriptionId(Long prescriptionId);
}
