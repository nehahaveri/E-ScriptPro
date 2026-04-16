package com.escriptpro.receptionist_service.repository;

import com.escriptpro.receptionist_service.entity.Receptionist;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReceptionistRepository extends JpaRepository<Receptionist, Long> {

    Optional<Receptionist> findByEmail(String email);

    Optional<Receptionist> findByPhone(String phone);

    List<Receptionist> findByDoctorIdOrderByNameAsc(Long doctorId);
}
