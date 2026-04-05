package com.escriptpro.medicine_service.util;

import com.escriptpro.medicine_service.entity.Medicine;
import com.escriptpro.medicine_service.entity.MedicineType;
import com.escriptpro.medicine_service.repository.MedicineRepository;
import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(2)
public class MedicineDataLoader implements CommandLineRunner {

    private static final String CLEAN_DATA_FILE = "medicines_clean.csv";

    private final MedicineRepository medicineRepository;

    public MedicineDataLoader(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (medicineRepository.count() > 0) {
            return;
        }

        loadData();
    }

    public void loadData() throws IOException {
        Path cleanDataPath = resolveCleanDataPath();

        try (BufferedReader reader = Files.newBufferedReader(cleanDataPath, StandardCharsets.UTF_8)) {
            String line = reader.readLine();
            if (line == null) {
                throw new IOException("Cleaned CSV is empty: " + cleanDataPath);
            }

            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) {
                    continue;
                }

                List<String> columns = parseCsvLine(line);
                if (columns.size() < 3) {
                    continue;
                }

                Medicine medicine = new Medicine();
                medicine.setBrand(columns.get(0).trim());
                medicine.setMedicineName(columns.get(1).trim());
                medicine.setType(MedicineType.valueOf(columns.get(2).trim()));
                medicineRepository.save(medicine);
            }
        }
    }

    private Path resolveCleanDataPath() {
        Path directPath = Path.of("src/main/resources", CLEAN_DATA_FILE);
        if (Files.exists(directPath)) {
            return directPath;
        }

        Path modulePath = Path.of("medicine-service", "src", "main", "resources", CLEAN_DATA_FILE);
        if (Files.exists(modulePath)) {
            return modulePath;
        }

        return directPath;
    }

    private List<String> parseCsvLine(String line) {
        List<String> values = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char ch = line.charAt(i);

            if (ch == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    current.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (ch == ',' && !inQuotes) {
                values.add(current.toString());
                current.setLength(0);
            } else {
                current.append(ch);
            }
        }

        values.add(current.toString());
        return values;
    }
}
