package com.escriptpro.pdf_service.dto;

import java.util.List;

public class TabletDTO {

    private String brand;
    private String medicineName;
    private Boolean morning;
    private Boolean afternoon;
    private Boolean night;
    private String scheduleType;
    private List<String> weeklyDays;
    private Boolean withWater;
    private Boolean chew;
    private String instruction;
    private Integer duration;
    private Integer quantity;

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

    public Boolean getWithWater() {
        return withWater;
    }

    public void setWithWater(Boolean withWater) {
        this.withWater = withWater;
    }

    public Boolean getChew() {
        return chew;
    }

    public void setChew(Boolean chew) {
        this.chew = chew;
    }

    public String getInstruction() {
        return instruction;
    }

    public void setInstruction(String instruction) {
        this.instruction = instruction;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
