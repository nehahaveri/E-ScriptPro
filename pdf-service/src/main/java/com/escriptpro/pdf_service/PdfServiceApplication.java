package com.escriptpro.pdf_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@EnableKafka
public class PdfServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(PdfServiceApplication.class, args);
	}

}
