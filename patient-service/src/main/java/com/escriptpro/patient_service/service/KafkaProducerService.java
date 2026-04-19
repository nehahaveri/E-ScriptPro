package com.escriptpro.patient_service.service;

import com.escriptpro.patient_service.dto.PatientEventDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

@Service
public class KafkaProducerService {

    private static final Logger log = LoggerFactory.getLogger(KafkaProducerService.class);
    private static final String TOPIC_NAME = "patient-events";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public KafkaProducerService(KafkaTemplate<String, String> kafkaTemplate, ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    public void sendPatientEvent(PatientEventDTO event) {
        try {
            String json = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(TOPIC_NAME, json);
            log.info("Patient event sent to Kafka: {}", event.getEventType());
        } catch (Exception ex) {
            log.warn("Failed to send patient event to Kafka. Continuing synchronous flow.", ex);
        }
    }
}
