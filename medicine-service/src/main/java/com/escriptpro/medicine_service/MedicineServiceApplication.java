package com.escriptpro.medicine_service;

import com.escriptpro.medicine_service.util.MedicineDataCleaner;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.core.annotation.Order;

@SpringBootApplication
@EnableCaching
public class MedicineServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(MedicineServiceApplication.class, args);
	}

	@Bean
	@Order(1)
	CommandLineRunner cleanMedicineDataOnStartup() {
		return args -> MedicineDataCleaner.cleanData();
	}

}
