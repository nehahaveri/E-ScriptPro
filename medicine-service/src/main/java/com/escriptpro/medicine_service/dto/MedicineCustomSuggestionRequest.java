package com.escriptpro.medicine_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicineCustomSuggestionRequest {

    private String type;

    private String name;
}
