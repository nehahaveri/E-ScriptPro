package com.escriptpro.pdf_service.dto;

public class InjectionDTO {

    private String brand;
    private String medicineName;
    private Boolean daily;
    private Boolean alternateDay;
    private Boolean weeklyOnce;

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getMedicineName() {
        return medicineName;
    }

    public void setMedicineName(String medicineName) {
        this.medicineName = medicineName;
    }

    public Boolean getDaily() {
        return daily;
    }

    public void setDaily(Boolean daily) {
        this.daily = daily;
    }

    public Boolean getAlternateDay() {
        return alternateDay;
    }

    public void setAlternateDay(Boolean alternateDay) {
        this.alternateDay = alternateDay;
    }

    public Boolean getWeeklyOnce() {
        return weeklyOnce;
    }

    public void setWeeklyOnce(Boolean weeklyOnce) {
        this.weeklyOnce = weeklyOnce;
    }
}
