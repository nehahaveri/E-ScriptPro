package com.escriptpro.medicine_service.repository;

import com.escriptpro.medicine_service.entity.Medicine;
import com.escriptpro.medicine_service.entity.MedicineType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    List<Medicine> findTop10ByMedicineNameContainingIgnoreCaseOrBrandContainingIgnoreCase(String name, String brand);

    List<Medicine> findTop10ByTypeAndMedicineNameContainingIgnoreCaseOrTypeAndBrandContainingIgnoreCase(
            MedicineType firstType,
            String name,
            MedicineType secondType,
            String brand);
}
