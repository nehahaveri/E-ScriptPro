package com.escriptpro.pdf_service.service;

import com.escriptpro.pdf_service.entity.GeneratedPdf;
import com.escriptpro.pdf_service.repository.GeneratedPdfRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class PdfStorageService {

    private static final Logger log = LoggerFactory.getLogger(PdfStorageService.class);

    private final GeneratedPdfRepository repository;

    public PdfStorageService(GeneratedPdfRepository repository) {
        this.repository = repository;
    }

    /**
     * Stores the PDF bytes in the database and returns the generated filename.
     */
    public String store(byte[] pdfBytes, Long patientId) {
        return store(pdfBytes, patientId, null);
    }

    public String store(byte[] pdfBytes, Long patientId, Long prescriptionId) {
        String filename = buildFilename(patientId);

        GeneratedPdf pdf = new GeneratedPdf();
        pdf.setPatientId(patientId);
        pdf.setPrescriptionId(prescriptionId);
        pdf.setFilename(filename);
        pdf.setPdfData(pdfBytes);

        repository.save(pdf);
        log.info("Stored PDF in DB: {} ({} bytes)", filename, pdfBytes.length);
        return filename;
    }

    /**
     * Retrieves a previously stored PDF by filename.
     */
    public byte[] retrieve(String filename) {
        return repository.findByFilename(filename)
                .map(GeneratedPdf::getPdfData)
                .orElse(null);
    }

    /**
     * Retrieves the latest PDF for a given prescription.
     */
    public byte[] retrieveByPrescriptionId(Long prescriptionId) {
        return repository.findByPrescriptionId(prescriptionId)
                .map(GeneratedPdf::getPdfData)
                .orElse(null);
    }

    /**
     * Lists all PDFs for a patient.
     */
    public List<GeneratedPdf> listByPatient(Long patientId) {
        return repository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    private String buildFilename(Long patientId) {
        String prefix = patientId != null ? "prescription-patient-" + patientId : "prescription";
        return prefix + "-" + UUID.randomUUID() + ".pdf";
    }
}
