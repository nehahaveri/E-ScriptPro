package com.escriptpro.medicine_service.repository;

import com.escriptpro.medicine_service.entity.Medicine;
import com.escriptpro.medicine_service.entity.MedicineType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    List<Medicine> findByMedicineNameContainingIgnoreCase(String name);

    List<Medicine> findByMedicineNameContainingIgnoreCaseAndType(String name, MedicineType type);
}
