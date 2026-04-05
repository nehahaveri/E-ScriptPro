package com.escriptpro.prescription_service.repository;

import com.escriptpro.prescription_service.entity.Tablet;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TabletRepository extends JpaRepository<Tablet, Long> {
}
