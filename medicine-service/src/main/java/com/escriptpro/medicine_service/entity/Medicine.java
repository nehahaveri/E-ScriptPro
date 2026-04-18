package com.escriptpro.medicine_service.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "medicine_master",
        indexes = {
                @Index(name = "idx_medicine_name", columnList = "name"),
                @Index(name = "idx_medicine_type_name", columnList = "type, name")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Medicine implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String generic_name;

    private String strength;

    @Enumerated(EnumType.STRING)
    private MedicineType type;

    private String name;
}
