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

    private String diagnosis;

    private String advice;

    private Integer consultationFee;

    private List<TabletDTO> tablets;

    private List<SyrupDTO> syrups;

    private List<InjectionDTO> injections;
}
