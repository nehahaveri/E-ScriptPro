package com.escriptpro.prescription_service.controller;

import com.escriptpro.prescription_service.dto.PrescriptionRequestDTO;
import com.escriptpro.prescription_service.service.PrescriptionService;
import com.escriptpro.prescription_service.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final JwtUtil jwtUtil;

    public PrescriptionController(PrescriptionService prescriptionService, JwtUtil jwtUtil) {
        this.prescriptionService = prescriptionService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public ResponseEntity<String> createPrescription(
            @RequestBody PrescriptionRequestDTO request,
            HttpServletRequest httpRequest) {
        String authorizationHeader = httpRequest.getHeader("Authorization");
        String token = authorizationHeader.substring(7);
        String email = jwtUtil.extractUsername(token);
        prescriptionService.createPrescription(request, email);
        return ResponseEntity.ok("Prescription created successfully");
    }
}
