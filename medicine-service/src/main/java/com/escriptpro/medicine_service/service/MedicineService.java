package com.escriptpro.medicine_service.service;

import com.escriptpro.medicine_service.entity.Medicine;
import com.escriptpro.medicine_service.entity.MedicineType;
import com.escriptpro.medicine_service.repository.MedicineRepository;
import com.escriptpro.medicine_service.util.MedicineSuggestionIndex;
import java.util.List;
import java.util.Locale;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final MedicineSuggestionIndex medicineSuggestionIndex;

    public MedicineService(
            MedicineRepository medicineRepository,
            MedicineSuggestionIndex medicineSuggestionIndex) {
        this.medicineRepository = medicineRepository;
        this.medicineSuggestionIndex = medicineSuggestionIndex;
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

    @Cacheable(
            value = "medicineCache",
            key = "'brand_' + T(String).valueOf(#query).toLowerCase() + '_' + (#type != null ? #type : 'ALL')"
    )
    public List<String> searchBrandSuggestions(String query, String type) {
        MedicineType medicineType = parseRequiredType(type);
        return medicineSuggestionIndex.searchBrandSuggestions(medicineType, query);
    }

    @Cacheable(
            value = "medicineCache",
            key = "'name_' + T(String).valueOf(#query).toLowerCase() + '_' + (#type != null ? #type : 'ALL')"
    )
    public List<String> searchNameSuggestions(String query, String type) {
        MedicineType medicineType = parseRequiredType(type);
        return medicineSuggestionIndex.searchNameSuggestions(medicineType, query);
    }

    @CacheEvict(value = "medicineCache", allEntries = true)
    public void registerCustomSuggestion(String type, String brand, String medicineName) {
        MedicineType medicineType = parseRequiredType(type);
        medicineSuggestionIndex.registerCustomSuggestion(medicineType, brand, medicineName);
    }

    private MedicineType parseType(String type) {
        if (type == null || type.isBlank()) {
            return null;
        }
        return MedicineType.valueOf(type.toUpperCase(Locale.ROOT));
    }

    private MedicineType parseRequiredType(String type) {
        if (type == null || type.isBlank()) {
            throw new IllegalArgumentException("type is required");
        }
        return MedicineType.valueOf(type.toUpperCase(Locale.ROOT));
    }
}
