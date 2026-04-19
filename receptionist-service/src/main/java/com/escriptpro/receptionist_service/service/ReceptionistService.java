package com.escriptpro.receptionist_service.service;

import com.escriptpro.receptionist_service.dto.ReceptionistRequest;
import com.escriptpro.receptionist_service.entity.Receptionist;
import com.escriptpro.receptionist_service.repository.ReceptionistRepository;
import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.Phonenumber;
import java.util.List;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ReceptionistService {

    private static final Logger log = LoggerFactory.getLogger(ReceptionistService.class);
    private static final PhoneNumberUtil PHONE_UTIL = PhoneNumberUtil.getInstance();

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
        receptionist.setPhone(normalizePhone(request.getPhone().trim()));
        receptionist.setDoctorId(request.getDoctorId());
        return receptionistRepository.save(receptionist);
    }

    public Receptionist getReceptionistByEmail(String email) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        return receptionistRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Receptionist not found"));
    }

    public Receptionist getReceptionistByPhone(String phone) {
        String normalizedPhone = normalizePhone(phone.trim());
        return receptionistRepository.findByPhone(normalizedPhone)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Receptionist not found"));
    }

    public List<Receptionist> getReceptionistsByDoctorId(Long doctorId) {
        return receptionistRepository.findByDoctorIdOrderByNameAsc(doctorId);
    }

    private String normalizePhone(String phone) {
        try {
            Phonenumber.PhoneNumber parsed = PHONE_UTIL.parse(phone, "IN");
            return PHONE_UTIL.format(parsed, PhoneNumberUtil.PhoneNumberFormat.E164);
        } catch (NumberParseException e) {
            log.warn("Could not parse phone '{}', using trimmed value", phone);
            return phone;
        }
    }
}
