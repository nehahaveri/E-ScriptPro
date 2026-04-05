package com.escriptpro.prescription_service.repository;

import com.escriptpro.prescription_service.entity.Injection;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InjectionRepository extends JpaRepository<Injection, Long> {
}
