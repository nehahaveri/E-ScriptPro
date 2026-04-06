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

    private String doctorName;
    private String clinicName;
    private String locality;
    private String education;
    private String logoUrl;
    private String signatureUrl;

    private String diagnosis;

    private String advice;

    private Integer consultationFee;

    private List<TabletDTO> tablets;

    private List<SyrupDTO> syrups;

    private List<InjectionDTO> injections;
}
