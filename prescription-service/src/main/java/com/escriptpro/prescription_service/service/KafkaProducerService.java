package com.escriptpro.prescription_service.service;

import com.escriptpro.prescription_service.dto.PrescriptionRequestDTO;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducerService {

    private static final Logger log = LoggerFactory.getLogger(KafkaProducerService.class);
    private static final String TOPIC_NAME = "prescription-events";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public KafkaProducerService(KafkaTemplate<String, String> kafkaTemplate, ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    public void sendPrescriptionEvent(PrescriptionRequestDTO request) {
        try {
            String json = objectMapper.writeValueAsString(request);
            kafkaTemplate.send(TOPIC_NAME, json);
            log.info("Event sent to Kafka");
        } catch (JacksonException ex) {
            log.error("Failed to serialize prescription event to JSON", ex);
        } catch (Exception ex) {
            log.warn("Failed to send event to Kafka. Continuing synchronous flow.", ex);
        }
    }
}
