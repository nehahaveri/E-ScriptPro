package com.escriptpro.pdf_service.dto;

import java.util.List;

public class PrescriptionRequestDTO {

    private Long patientId;
    private String diagnosis;
    private String advice;
    private Integer consultationFee;
    private List<TabletDTO> tablets;
    private List<SyrupDTO> syrups;
    private List<InjectionDTO> injections;

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getAdvice() {
        return advice;
    }

    public void setAdvice(String advice) {
        this.advice = advice;
    }

    public Integer getConsultationFee() {
        return consultationFee;
    }

    public void setConsultationFee(Integer consultationFee) {
        this.consultationFee = consultationFee;
    }

    public List<TabletDTO> getTablets() {
        return tablets;
    }

    public void setTablets(List<TabletDTO> tablets) {
        this.tablets = tablets;
    }

    public List<SyrupDTO> getSyrups() {
        return syrups;
    }

    public void setSyrups(List<SyrupDTO> syrups) {
        this.syrups = syrups;
    }

    public List<InjectionDTO> getInjections() {
        return injections;
    }

    public void setInjections(List<InjectionDTO> injections) {
        this.injections = injections;
    }
}
