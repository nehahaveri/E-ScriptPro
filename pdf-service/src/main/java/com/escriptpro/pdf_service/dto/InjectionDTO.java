package com.escriptpro.pdf_service.dto;

public class InjectionDTO {

    private Boolean daily;
    private Boolean alternateDay;
    private Boolean weeklyOnce;

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
