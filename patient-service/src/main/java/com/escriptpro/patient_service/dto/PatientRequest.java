package com.escriptpro.patient_service.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientRequest {

    @NotBlank(message = "Patient name is required")
    @Size(max = 120, message = "Patient name must be at most 120 characters")
    private String name;

    @Min(value = 0, message = "Age must be at least 0")
    @Max(value = 150, message = "Age must be at most 150")
    private Integer age;

    @NotBlank(message = "Gender is required")
    private String gender;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Mobile number must be exactly 10 digits")
    private String mobile;

    @Size(max = 255, message = "Address must be at most 255 characters")
    private String address;

    @Pattern(
            regexp = "^$|^\\d{4}-\\d{2}-\\d{2}$",
            message = "Appointment date must be in YYYY-MM-DD format"
    )
    private String appointmentDate;

    @Pattern(
            regexp = "^$|^([01]\\d|2[0-3]):[0-5]\\d$",
            message = "Appointment time must be in HH:MM format"
    )
    private String appointmentTime;

    @Pattern(
            regexp = "^$|^(BOOKED|CONFIRMED|COMPLETED|CANCELLED|NO_SHOW)$",
            message = "Appointment status must be one of BOOKED, CONFIRMED, COMPLETED, CANCELLED, or NO_SHOW"
    )
    private String appointmentStatus;

    @Min(value = 0, message = "Appointment reminder must be at least 0 minutes")
    @Max(value = 10080, message = "Appointment reminder must be at most 10080 minutes")
    private Integer appointmentReminderMinutes;

    @Min(value = 0, message = "Height must be at least 0")
    @Max(value = 300, message = "Height must be at most 300 cm")
    private Integer height;

    @Min(value = 0, message = "Weight must be at least 0")
    @Max(value = 500, message = "Weight must be at most 500 kg")
    private Integer weight;
}
