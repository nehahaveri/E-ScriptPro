package com.escriptpro.medicine_service.service;

import com.escriptpro.medicine_service.entity.Medicine;
import com.escriptpro.medicine_service.entity.MedicineType;
import com.escriptpro.medicine_service.repository.MedicineRepository;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;

@Service
public class MedicineService {

    private final MedicineRepository medicineRepository;

    public MedicineService(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }

    public List<Medicine> searchMedicines(String query, String type) {
        String normalizedQuery = query == null ? "" : query.trim();
        List<Medicine> medicines;

        if (type != null && !type.isBlank()) {
            MedicineType medicineType = MedicineType.valueOf(type.toUpperCase(Locale.ROOT));
            medicines = medicineRepository.findTop10ByTypeAndMedicineNameContainingIgnoreCaseOrTypeAndBrandContainingIgnoreCase(
                    medicineType,
                    normalizedQuery,
                    medicineType,
                    normalizedQuery
            );
        } else {
            medicines = medicineRepository.findTop10ByMedicineNameContainingIgnoreCaseOrBrandContainingIgnoreCase(
                    normalizedQuery,
                    normalizedQuery
            );
        }

        return medicines;
    }
}
