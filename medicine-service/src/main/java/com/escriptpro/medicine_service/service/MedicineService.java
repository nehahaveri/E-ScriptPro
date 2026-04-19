package com.escriptpro.medicine_service.service;

import com.escriptpro.medicine_service.entity.Medicine;
import com.escriptpro.medicine_service.entity.MedicineType;
import com.escriptpro.medicine_service.repository.MedicineRepository;
import com.escriptpro.medicine_service.util.MedicineSuggestionIndex;
import java.util.List;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class MedicineService {

    private static final Logger log = LoggerFactory.getLogger(MedicineService.class);

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
        log.debug("DB HIT - fetching medicines");
        String normalizedQuery = query == null ? "" : query.trim();
        PageRequest topTen = PageRequest.of(0, 10);

        if (type != null && !type.isBlank()) {
            MedicineType medicineType = MedicineType.valueOf(type.toUpperCase(Locale.ROOT));
            return medicineRepository.searchAutocompleteByType(normalizedQuery, medicineType, topTen);
        }
        return medicineRepository.searchAutocomplete(normalizedQuery, topTen);
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
    public void registerCustomSuggestion(String type, String name) {
        MedicineType medicineType = parseRequiredType(type);
        medicineSuggestionIndex.registerCustomSuggestion(medicineType, name);

        // Also persist to DB if not already present
        String normalized = name == null ? null : name.trim();
        if (normalized != null && !normalized.isEmpty()) {
            if (medicineRepository.findByNameAndType(normalized, medicineType).isEmpty()) {
                Medicine medicine = new Medicine();
                medicine.setName(normalized);
                medicine.setType(medicineType);
                medicineRepository.save(medicine);
            }
        }
    }

    private MedicineType parseRequiredType(String type) {
        if (type == null || type.isBlank()) {
            throw new IllegalArgumentException("type is required");
        }
        return MedicineType.valueOf(type.toUpperCase(Locale.ROOT));
    }
}
