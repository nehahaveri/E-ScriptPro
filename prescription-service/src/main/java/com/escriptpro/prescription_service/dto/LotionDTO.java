package com.escriptpro.prescription_service.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LotionDTO {

    private String name;

    private String applicationArea;

    private Boolean morning;

    private Boolean afternoon;

    private Boolean night;

    private String scheduleType;

    private List<String> weeklyDays;

    private Integer duration;

    private Integer quantity;
}

