package com.escriptpro.pdf_service.service;

import com.escriptpro.pdf_service.client.PrescriptionClient;
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
    private final PrescriptionClient prescriptionClient;
    private final ObjectMapper objectMapper;

    public KafkaConsumerService(PdfService pdfService, PrescriptionClient prescriptionClient, ObjectMapper objectMapper) {
        this.pdfService = pdfService;
        this.prescriptionClient = prescriptionClient;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(
            topics = "prescription-events",
            groupId = "pdf-group"
    )
    public void consumePrescriptionEvent(String requestPayload) {
        try {
            PrescriptionRequestDTO request = objectMapper.readValue(requestPayload, PrescriptionRequestDTO.class);
            
            // Generate and store PDF to S3, returns S3 key
            if (request.getDoctorId() != null && request.getPrescriptionId() != null) {
                String pdfKey = pdfService.generateAndStorePrescriptionPdf(request, request.getDoctorId(), request.getPrescriptionId());
                
                // Update prescription entity with the PDF key
                prescriptionClient.updatePrescriptionPdfKey(request.getPrescriptionId(), pdfKey);
                
                log.info("Generated PDF and updated prescription {} with key: {}", request.getPrescriptionId(), pdfKey);
            } else {
                // Fallback for backward compatibility, just generate without storing
                pdfService.generatePrescriptionPdf(request);
            }
            
            log.info("Received event and generated PDF for prescription {}", request.getPrescriptionId());
        } catch (Exception ex) {
            log.error("Failed to process Kafka prescription event", ex);
        }
    }
}
