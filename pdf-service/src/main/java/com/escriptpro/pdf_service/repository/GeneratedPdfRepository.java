package com.escriptpro.pdf_service.repository;

import com.escriptpro.pdf_service.entity.GeneratedPdf;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GeneratedPdfRepository extends JpaRepository<GeneratedPdf, Long> {
    Optional<GeneratedPdf> findByFilename(String filename);
    List<GeneratedPdf> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    Optional<GeneratedPdf> findByPrescriptionId(Long prescriptionId);
}

