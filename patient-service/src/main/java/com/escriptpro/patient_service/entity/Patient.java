package com.escriptpro.patient_service.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long patientNumber;

    private String name;

    private Integer age;

    private String gender;

    private String mobile;

    private String address;

    private String appointmentDate;

    private String appointmentTime;

    private String appointmentStatus;

    private Integer appointmentReminderMinutes;

    private String calendarProvider;

    private String calendarSyncStatus;

    private String externalCalendarEventId;

    private Integer height;

    private Integer weight;

    private Long doctorId;
}
