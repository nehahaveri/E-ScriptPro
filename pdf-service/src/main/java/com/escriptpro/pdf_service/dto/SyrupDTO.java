package com.escriptpro.pdf_service.dto;

import java.util.List;

public class SyrupDTO {

    private String name;
    private Boolean morning;
    private Boolean afternoon;
    private Boolean night;
    private String scheduleType;
    private List<String> weeklyDays;
    private String intakeType;
    private Integer intakeValue;
    private Integer duration;
    private Integer quantity;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public String getIntakeType() {
        return intakeType;
    }

    public void setIntakeType(String intakeType) {
        this.intakeType = intakeType;
    }

    public Integer getIntakeValue() {
        return intakeValue;
    }

    public void setIntakeValue(Integer intakeValue) {
        this.intakeValue = intakeValue;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
