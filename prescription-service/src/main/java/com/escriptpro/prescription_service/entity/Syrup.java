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
@Table(name = "syrups")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Syrup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "prescription_id")
    private Prescription prescription;

    private String brand;

    private String syrupName;

    private Boolean morning;

    private Boolean afternoon;

    private Boolean night;

    private String scheduleType;

    private String weeklyDays;

    private Integer duration;

    private Integer quantity;
}
