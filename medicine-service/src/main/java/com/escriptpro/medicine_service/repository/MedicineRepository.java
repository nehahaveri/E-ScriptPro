package com.escriptpro.medicine_service.repository;

import com.escriptpro.medicine_service.entity.Medicine;
import com.escriptpro.medicine_service.entity.MedicineType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    @Query("""
            SELECT m
            FROM Medicine m
            WHERE LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%'))
            ORDER BY
              CASE
                WHEN LOWER(m.name) LIKE LOWER(CONCAT(:query, '%')) THEN 0
                WHEN LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%')) THEN 1
                ELSE 2
              END,
              m.name ASC
            """)
    List<Medicine> searchAutocomplete(@Param("query") String query, Pageable pageable);

    @Query("""
            SELECT m
            FROM Medicine m
            WHERE m.type = :type
              AND LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%'))
            ORDER BY
              CASE
                WHEN LOWER(m.name) LIKE LOWER(CONCAT(:query, '%')) THEN 0
                WHEN LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%')) THEN 1
                ELSE 2
              END,
              m.name ASC
            """)
    List<Medicine> searchAutocompleteByType(
            @Param("query") String query,
            @Param("type") MedicineType type,
            Pageable pageable);

    @Query("""
            SELECT DISTINCT m.name
            FROM Medicine m
            WHERE (:type IS NULL OR m.type = :type)
              AND LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%'))
            ORDER BY
              CASE
                WHEN LOWER(m.name) LIKE LOWER(CONCAT(:query, '%')) THEN 0
                ELSE 1
              END,
              m.name ASC
            """)
    List<String> searchNameSuggestions(
            @Param("query") String query,
            @Param("type") MedicineType type,
            Pageable pageable);

    Optional<Medicine> findByNameAndType(String name, MedicineType type);
}
