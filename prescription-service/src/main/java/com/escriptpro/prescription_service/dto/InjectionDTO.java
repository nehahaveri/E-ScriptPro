package com.escriptpro.prescription_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InjectionDTO {

    private String brand;

    private String medicineName;

    private Boolean daily;

    private Boolean alternateDay;

    private Boolean weeklyOnce;
}
