package com.escriptpro.pdf_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "generated_pdfs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedPdf {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long prescriptionId;

    private Long patientId;

    private String filename;

    @Lob
    @Column(columnDefinition = "BYTEA")
    private byte[] pdfData;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

