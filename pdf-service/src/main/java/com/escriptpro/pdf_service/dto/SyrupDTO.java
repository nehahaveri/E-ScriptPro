package com.escriptpro.pdf_service.dto;

public class SyrupDTO {

    private String brand;
    private String syrupName;
    private Boolean morning;
    private Boolean afternoon;
    private Boolean night;
    private Integer duration;

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getSyrupName() {
        return syrupName;
    }

    public void setSyrupName(String syrupName) {
        this.syrupName = syrupName;
    }

    public Boolean getMorning() {
        return morning;
    }

    public void setMorning(Boolean morning) {
        this.morning = morning;
    }

    public Boolean getAfternoon() {
        return afternoon;
    }

    public void setAfternoon(Boolean afternoon) {
        this.afternoon = afternoon;
    }

    public Boolean getNight() {
        return night;
    }

    public void setNight(Boolean night) {
        this.night = night;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }
}
