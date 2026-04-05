package com.escriptpro.prescription_service.service;

import com.escriptpro.prescription_service.dto.PrescriptionRequestDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducerService {

    private static final Logger log = LoggerFactory.getLogger(KafkaProducerService.class);
    private static final String TOPIC_NAME = "prescription-events";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public KafkaProducerService(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendPrescriptionEvent(PrescriptionRequestDTO request) {
        try {
            kafkaTemplate.send(TOPIC_NAME, request);
            log.info("Event sent to Kafka");
        } catch (Exception ex) {
            log.warn("Failed to send event to Kafka. Continuing synchronous flow.", ex);
        }
    }
}
