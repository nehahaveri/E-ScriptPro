package com.escriptpro.medicine_service.service;

import com.escriptpro.medicine_service.entity.Medicine;
import com.escriptpro.medicine_service.entity.MedicineType;
import com.escriptpro.medicine_service.repository.MedicineRepository;
import java.util.List;
import java.util.Locale;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class MedicineService {

    private final MedicineRepository medicineRepository;

    public MedicineService(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }

    @Cacheable(
            value = "medicineCache",
            key = "T(String).valueOf(#query).toLowerCase() + '_' + (#type != null ? #type : 'ALL')"
    )
    public List<Medicine> searchMedicines(String query, String type) {
        System.out.println("🔥 DB HIT - fetching medicines");
        String normalizedQuery = query == null ? "" : query.trim();
        PageRequest topTen = PageRequest.of(0, 10);
        List<Medicine> medicines;

        if (type != null && !type.isBlank()) {
            MedicineType medicineType = MedicineType.valueOf(type.toUpperCase(Locale.ROOT));
            medicines = medicineRepository.searchAutocompleteByType(
                    normalizedQuery,
                    medicineType,
                    topTen
            );
        } else {
            medicines = medicineRepository.searchAutocomplete(
                    normalizedQuery,
                    topTen
            );
        }

        return medicines;
    }
}
