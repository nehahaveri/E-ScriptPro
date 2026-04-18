package com.escriptpro.prescription_service.dto;

import com.escriptpro.prescription_service.entity.Instruction;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TabletDTO {

    private String name;

    private Boolean morning;

    private Boolean afternoon;

    private Boolean night;

    private String scheduleType;

    private List<String> weeklyDays;

    private Boolean withWater;

    private Boolean chew;

    private Instruction instruction;

    private Integer duration;

    private Integer quantity;
}
