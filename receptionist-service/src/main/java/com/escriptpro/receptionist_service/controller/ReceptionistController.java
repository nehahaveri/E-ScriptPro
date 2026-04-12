package com.escriptpro.receptionist_service.controller;

import com.escriptpro.receptionist_service.dto.ReceptionistRequest;
import com.escriptpro.receptionist_service.entity.Receptionist;
import com.escriptpro.receptionist_service.service.ReceptionistService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/receptionists")
public class ReceptionistController {

    private final ReceptionistService receptionistService;

    public ReceptionistController(ReceptionistService receptionistService) {
        this.receptionistService = receptionistService;
    }

    @PostMapping
    public Receptionist createReceptionist(@Valid @RequestBody ReceptionistRequest request) {
        return receptionistService.createReceptionist(request);
    }

    @GetMapping("/email/{email}")
    public Receptionist getReceptionistByEmail(@PathVariable String email) {
        return receptionistService.getReceptionistByEmail(email);
    }

    @GetMapping("/phone/{phone}")
    public Receptionist getReceptionistByPhone(@PathVariable String phone) {
        return receptionistService.getReceptionistByPhone(phone);
    }

    @GetMapping("/doctor/{doctorId}")
    public List<Receptionist> getReceptionistsByDoctorId(@PathVariable Long doctorId) {
        return receptionistService.getReceptionistsByDoctorId(doctorId);
    }
}
