package com.escriptpro.prescription_service.repository;

import com.escriptpro.prescription_service.entity.Injection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InjectionRepository extends JpaRepository<Injection, Long> {

    List<Injection> findByPrescriptionId(Long prescriptionId);

    void deleteByPrescriptionId(Long prescriptionId);
}
