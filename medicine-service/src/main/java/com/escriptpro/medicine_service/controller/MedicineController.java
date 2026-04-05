package com.escriptpro.medicine_service.controller;

import com.escriptpro.medicine_service.entity.Medicine;
import com.escriptpro.medicine_service.service.MedicineService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/medicines")
public class MedicineController {

    private final MedicineService medicineService;

    public MedicineController(MedicineService medicineService) {
        this.medicineService = medicineService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<Medicine>> searchMedicines(
            @RequestParam String query,
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(medicineService.searchMedicines(query, type));
    }
}
