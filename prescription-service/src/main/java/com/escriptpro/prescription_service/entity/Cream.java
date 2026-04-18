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
@Table(name = "creams")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cream {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "prescription_id")
    private Prescription prescription;

    private String name;
    private String applicationArea;
    private Boolean morning;
    private Boolean afternoon;
    private Boolean night;
    private String scheduleType;
    private String weeklyDays;
    private Integer duration;
    private Integer quantity;
}

