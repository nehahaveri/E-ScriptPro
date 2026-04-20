package com.escriptpro.pdf_service.dto;

import java.util.List;

public class PrescriptionRequestDTO {

    private Long doctorId;
    private Long prescriptionId;
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

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public Long getPrescriptionId() {
        return prescriptionId;
    }

    public void setPrescriptionId(Long prescriptionId) {
        this.prescriptionId = prescriptionId;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public String getDoctorEmail() {
        return doctorEmail;
    }

    public void setDoctorEmail(String doctorEmail) {
        this.doctorEmail = doctorEmail;
    }

    public String getDoctorPhone() {
        return doctorPhone;
    }

    public void setDoctorPhone(String doctorPhone) {
        this.doctorPhone = doctorPhone;
    }

    public String getClinicName() {
        return clinicName;
    }

    public void setClinicName(String clinicName) {
        this.clinicName = clinicName;
    }

    public Boolean getShowDoctorName() {
        return showDoctorName;
    }

    public void setShowDoctorName(Boolean showDoctorName) {
        this.showDoctorName = showDoctorName;
    }

    public Boolean getShowClinicName() {
        return showClinicName;
    }

    public void setShowClinicName(Boolean showClinicName) {
        this.showClinicName = showClinicName;
    }

    public String getLocality() {
        return locality;
    }

    public void setLocality(String locality) {
        this.locality = locality;
    }

    public String getEducation() {
        return education;
    }

    public void setEducation(String education) {
        this.education = education;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getSignatureUrl() {
        return signatureUrl;
    }

    public void setSignatureUrl(String signatureUrl) {
        this.signatureUrl = signatureUrl;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public Integer getPatientAge() {
        return patientAge;
    }

    public void setPatientAge(Integer patientAge) {
        this.patientAge = patientAge;
    }

    public String getPatientGender() {
        return patientGender;
    }

    public void setPatientGender(String patientGender) {
        this.patientGender = patientGender;
    }

    public String getVisitDate() {
        return visitDate;
    }

    public void setVisitDate(String visitDate) {
        this.visitDate = visitDate;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getComplaints() {
        return complaints;
    }

    public void setComplaints(String complaints) {
        this.complaints = complaints;
    }

    public String getExamination() {
        return examination;
    }

    public void setExamination(String examination) {
        this.examination = examination;
    }

    public String getInvestigationAdvice() {
        return investigationAdvice;
    }

    public void setInvestigationAdvice(String investigationAdvice) {
        this.investigationAdvice = investigationAdvice;
    }

    public String getBp() {
        return bp;
    }

    public void setBp(String bp) {
        this.bp = bp;
    }

    public String getSugar() {
        return sugar;
    }

    public void setSugar(String sugar) {
        this.sugar = sugar;
    }

    public String getTreatment() {
        return treatment;
    }

    public void setTreatment(String treatment) {
        this.treatment = treatment;
    }

    public String getFollowUp() {
        return followUp;
    }

    public void setFollowUp(String followUp) {
        this.followUp = followUp;
    }

    public String getFollowUpDate() {
        return followUpDate;
    }

    public void setFollowUpDate(String followUpDate) {
        this.followUpDate = followUpDate;
    }

    public String getXrayImageUrl() {
        return xrayImageUrl;
    }

    public void setXrayImageUrl(String xrayImageUrl) {
        this.xrayImageUrl = xrayImageUrl;
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

    public Integer getFee() {
        return fee;
    }

    public void setFee(Integer fee) {
        this.fee = fee;
    }

    public List<TabletDTO> getTablets() {
        return tablets;
    }

    public void setTablets(List<TabletDTO> tablets) {
        this.tablets = tablets;
    }

    public List<CapsuleDTO> getCapsules() {
        return capsules;
    }

    public void setCapsules(List<CapsuleDTO> capsules) {
        this.capsules = capsules;
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

    public List<LotionDTO> getLotions() {
        return lotions;
    }

    public void setLotions(List<LotionDTO> lotions) {
        this.lotions = lotions;
    }

    public List<CreamDTO> getCreams() {
        return creams;
    }

    public void setCreams(List<CreamDTO> creams) {
        this.creams = creams;
    }

    public List<OintmentDTO> getOintments() {
        return ointments;
    }

    public void setOintments(List<OintmentDTO> ointments) {
        this.ointments = ointments;
    }

    public List<GelDTO> getGels() {
        return gels;
    }

    public void setGels(List<GelDTO> gels) {
        this.gels = gels;
    }

    public List<SuspensionDTO> getSuspensions() {
        return suspensions;
    }

    public void setSuspensions(List<SuspensionDTO> suspensions) {
        this.suspensions = suspensions;
    }
}
