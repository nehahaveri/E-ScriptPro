package com.escriptpro.medicine_service.repository;

import com.escriptpro.medicine_service.entity.Medicine;
import com.escriptpro.medicine_service.entity.MedicineType;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    @Query("""
            SELECT m
            FROM Medicine m
            WHERE LOWER(m.brand) LIKE LOWER(CONCAT('%', :query, '%'))
               OR LOWER(m.medicineName) LIKE LOWER(CONCAT('%', :query, '%'))
            ORDER BY
              CASE
                WHEN LOWER(m.brand) LIKE LOWER(CONCAT(:query, '%')) THEN 0
                WHEN LOWER(m.medicineName) LIKE LOWER(CONCAT(:query, '%')) THEN 1
                WHEN LOWER(m.brand) LIKE LOWER(CONCAT('%', :query, '%')) THEN 2
                WHEN LOWER(m.medicineName) LIKE LOWER(CONCAT('%', :query, '%')) THEN 3
                ELSE 4
              END,
              m.brand ASC,
              m.medicineName ASC
            """)
    List<Medicine> searchAutocomplete(@Param("query") String query, Pageable pageable);

    @Query("""
            SELECT m
            FROM Medicine m
            WHERE m.type = :type
              AND (
                   LOWER(m.brand) LIKE LOWER(CONCAT('%', :query, '%'))
                   OR LOWER(m.medicineName) LIKE LOWER(CONCAT('%', :query, '%'))
              )
            ORDER BY
              CASE
                WHEN LOWER(m.brand) LIKE LOWER(CONCAT(:query, '%')) THEN 0
                WHEN LOWER(m.medicineName) LIKE LOWER(CONCAT(:query, '%')) THEN 1
                WHEN LOWER(m.brand) LIKE LOWER(CONCAT('%', :query, '%')) THEN 2
                WHEN LOWER(m.medicineName) LIKE LOWER(CONCAT('%', :query, '%')) THEN 3
                ELSE 4
              END,
              m.brand ASC,
              m.medicineName ASC
            """)
    List<Medicine> searchAutocompleteByType(
            @Param("query") String query,
            @Param("type") MedicineType type,
            Pageable pageable);
}
