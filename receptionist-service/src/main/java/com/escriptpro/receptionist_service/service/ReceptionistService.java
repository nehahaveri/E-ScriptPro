package com.escriptpro.receptionist_service.service;

import com.escriptpro.receptionist_service.dto.ReceptionistRequest;
import com.escriptpro.receptionist_service.entity.Receptionist;
import com.escriptpro.receptionist_service.repository.ReceptionistRepository;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ReceptionistService {

    private final ReceptionistRepository receptionistRepository;

    public ReceptionistService(ReceptionistRepository receptionistRepository) {
        this.receptionistRepository = receptionistRepository;
    }

    public Receptionist createReceptionist(ReceptionistRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);
        if (receptionistRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Receptionist already exists with this email");
        }

        Receptionist receptionist = new Receptionist();
        receptionist.setName(request.getName().trim());
        receptionist.setEmail(normalizedEmail);
        receptionist.setPhone(request.getPhone().trim());
        receptionist.setDoctorId(request.getDoctorId());
        return receptionistRepository.save(receptionist);
    }

    public Receptionist getReceptionistByEmail(String email) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        return receptionistRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Receptionist not found"));
    }

    public Receptionist getReceptionistByPhone(String phone) {
        String normalizedPhone = phone.trim();
        return receptionistRepository.findByPhone(normalizedPhone)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Receptionist not found"));
    }

    public List<Receptionist> getReceptionistsByDoctorId(Long doctorId) {
        return receptionistRepository.findByDoctorIdOrderByNameAsc(doctorId);
    }
}
