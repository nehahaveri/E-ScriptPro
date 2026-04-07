package com.escriptpro.prescription_service.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "injections")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Injection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "prescription_id")
    private Prescription prescription;

    private String brand;

    private String medicineName;

    private Boolean daily;

    private Boolean alternateDay;

    private Boolean weeklyOnce;

    private String scheduleType;

    private String weeklyDays;
}
