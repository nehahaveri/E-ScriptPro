package com.escriptpro.pdf_service.service;

import com.escriptpro.pdf_service.dto.PrescriptionRequestDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

@Service
public class KafkaConsumerService {

    private static final Logger log = LoggerFactory.getLogger(KafkaConsumerService.class);

    private final PdfService pdfService;
    private final PdfStorageService pdfStorageService;
    private final ObjectMapper objectMapper;

    public KafkaConsumerService(PdfService pdfService, PdfStorageService pdfStorageService, ObjectMapper objectMapper) {
        this.pdfService = pdfService;
        this.pdfStorageService = pdfStorageService;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(
            topics = "prescription-events",
            groupId = "pdf-group"
    )
    public void consumePrescriptionEvent(String requestPayload) {
        try {
            PrescriptionRequestDTO request = objectMapper.readValue(requestPayload, PrescriptionRequestDTO.class);
            byte[] pdfBytes = pdfService.generatePrescriptionPdf(request);
            String filename = pdfStorageService.store(pdfBytes, request.getPatientId(), request.getPrescriptionId());
            log.info("Received event, generated and stored PDF: {}", filename);
        } catch (Exception ex) {
            log.error("Failed to process Kafka prescription event", ex);
        }
    }
}
