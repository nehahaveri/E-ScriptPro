package com.escriptpro.prescription_service.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "prescriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long doctorId;

    private Long patientId;

    private String doctorName;

    private String doctorEmail;

    private String doctorPhone;

    private String clinicName;

    private Boolean showDoctorName;

    private Boolean showClinicName;

    private String locality;

    private String education;

    private String logoUrl;

    private String signatureUrl;

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

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
