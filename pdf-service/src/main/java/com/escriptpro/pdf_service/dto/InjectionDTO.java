package com.escriptpro.pdf_service.dto;

import java.util.List;

public class InjectionDTO {

    private String name;
    private Boolean daily;
    private Boolean alternateDay;
    private Boolean weeklyOnce;
    private String scheduleType;
    private List<String> weeklyDays;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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
