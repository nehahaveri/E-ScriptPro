package com.escriptpro.prescription_service.repository;

import com.escriptpro.prescription_service.entity.Tablet;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TabletRepository extends JpaRepository<Tablet, Long> {

    List<Tablet> findByPrescriptionId(Long prescriptionId);

    void deleteByPrescriptionId(Long prescriptionId);
}
