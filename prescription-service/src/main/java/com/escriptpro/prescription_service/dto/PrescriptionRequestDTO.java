package com.escriptpro.prescription_service.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionRequestDTO {

    private Long patientId;
    private Long prescriptionId;

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
    private String patientName;
    private Integer patientAge;
    private String patientGender;
    private String visitDate;

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
    private Integer fee;

    private List<TabletDTO> tablets;

    private List<CapsuleDTO> capsules;

    private List<SyrupDTO> syrups;

    private List<InjectionDTO> injections;

    private List<LotionDTO> lotions;

    private List<CreamDTO> creams;

    private List<OintmentDTO> ointments;

    private List<GelDTO> gels;

    private List<SuspensionDTO> suspensions;
}
