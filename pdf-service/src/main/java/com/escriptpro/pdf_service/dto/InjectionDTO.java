package com.escriptpro.pdf_service.dto;

import java.util.List;

public class InjectionDTO {

    private String brand;
    private String medicineName;
    private Boolean daily;
    private Boolean alternateDay;
    private Boolean weeklyOnce;
    private String scheduleType;
    private List<String> weeklyDays;

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

    public String getScheduleType() {
        return scheduleType;
    }

    public void setScheduleType(String scheduleType) {
        this.scheduleType = scheduleType;
    }

    public List<String> getWeeklyDays() {
        return weeklyDays;
    }

    public void setWeeklyDays(List<String> weeklyDays) {
        this.weeklyDays = weeklyDays;
    }
}
