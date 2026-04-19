package com.escriptpro.prescription_service.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionHistoryDTO {

    private Long id;
    private String complaints;
    private String examination;
    private String investigationAdvice;
    private String diagnosis;
    private String bp;
    private String sugar;
    private String treatment;
    private String followUp;
    private String followUpDate;
    private String xrayImageUrl;
    private String advice;
    private Integer consultationFee;
    private LocalDate visitDate;
    private LocalDateTime createdAt;
}

