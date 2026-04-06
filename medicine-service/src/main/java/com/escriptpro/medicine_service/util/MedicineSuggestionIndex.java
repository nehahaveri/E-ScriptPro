package com.escriptpro.medicine_service.util;

import com.escriptpro.medicine_service.entity.MedicineType;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(3)
public class MedicineSuggestionIndex implements CommandLineRunner {

    private static final String CLEAN_DATA_FILE = "medicines_clean.csv";
    private static final int LIMIT = 10;

    private final Map<MedicineType, Set<String>> brands = new EnumMap<>(MedicineType.class);
    private final Map<MedicineType, Set<String>> names = new EnumMap<>(MedicineType.class);

    public MedicineSuggestionIndex() {
        for (MedicineType type : MedicineType.values()) {
            brands.put(type, new TreeSet<>(String.CASE_INSENSITIVE_ORDER));
            names.put(type, new TreeSet<>(String.CASE_INSENSITIVE_ORDER));
        }
    }

    @Override
    public void run(String... args) throws Exception {
        buildIndexCsvFiles();
        loadIndexFromCsvFiles();
    }

    public synchronized List<String> searchBrandSuggestions(MedicineType type, String query) {
        return search(brands.get(type), query);
    }

    public synchronized List<String> searchNameSuggestions(MedicineType type, String query) {
        return search(names.get(type), query);
    }

    public synchronized void registerCustomSuggestion(MedicineType type, String brand, String medicineName) {
        String normalizedBrand = normalize(brand);
        String normalizedName = normalize(medicineName);

        if (normalizedBrand != null && brands.get(type).add(normalizedBrand)) {
            appendLine(resolveIndexPath(type, "brands"), normalizedBrand);
        }
        if (normalizedName != null && names.get(type).add(normalizedName)) {
            appendLine(resolveIndexPath(type, "names"), normalizedName);
        }
    }

    private List<String> search(Set<String> source, String query) {
        if (source == null) {
            return List.of();
        }

        String normalizedQuery = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
        if (normalizedQuery.isEmpty()) {
            return source.stream().limit(LIMIT).toList();
        }

        List<String> startsWith = new ArrayList<>();
        List<String> contains = new ArrayList<>();

        for (String value : source) {
            String lower = value.toLowerCase(Locale.ROOT);
            if (lower.startsWith(normalizedQuery)) {
                startsWith.add(value);
            } else if (lower.contains(normalizedQuery)) {
                contains.add(value);
            }
        }

        List<String> merged = new ArrayList<>(LIMIT);
        for (String value : startsWith) {
            if (merged.size() == LIMIT) {
                break;
            }
            merged.add(value);
        }
        for (String value : contains) {
            if (merged.size() == LIMIT) {
                break;
            }
            merged.add(value);
        }
        return merged;
    }

    private void buildIndexCsvFiles() throws IOException {
        Path cleanDataPath = resolveResourcePath(CLEAN_DATA_FILE);
        if (!Files.exists(cleanDataPath)) {
            return;
        }

        Map<MedicineType, Set<String>> brandAccumulator = new EnumMap<>(MedicineType.class);
        Map<MedicineType, Set<String>> nameAccumulator = new EnumMap<>(MedicineType.class);
        for (MedicineType type : MedicineType.values()) {
            brandAccumulator.put(type, new LinkedHashSet<>());
            nameAccumulator.put(type, new LinkedHashSet<>());
        }

        try (BufferedReader reader = Files.newBufferedReader(cleanDataPath, StandardCharsets.UTF_8)) {
            String line = reader.readLine();
            if (line == null) {
                return;
            }

            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) {
                    continue;
                }
                List<String> cols = parseCsvLine(line);
                if (cols.size() < 3) {
                    continue;
                }
                String brand = normalize(cols.get(0));
                String name = normalize(cols.get(1));
                String typeRaw = normalize(cols.get(2));
                if (typeRaw == null) {
                    continue;
                }

                MedicineType type;
                try {
                    type = MedicineType.valueOf(typeRaw.toUpperCase(Locale.ROOT));
                } catch (Exception ex) {
                    continue;
                }

                if (brand != null) {
                    brandAccumulator.get(type).add(brand);
                }
                if (name != null) {
                    nameAccumulator.get(type).add(name);
                }
            }
        }

        for (MedicineType type : MedicineType.values()) {
            writeIndex(resolveIndexPath(type, "brands"), "brand", brandAccumulator.get(type));
            writeIndex(resolveIndexPath(type, "names"), "medicine_name", nameAccumulator.get(type));
        }
    }

    private void loadIndexFromCsvFiles() throws IOException {
        for (MedicineType type : MedicineType.values()) {
            loadIndex(resolveIndexPath(type, "brands"), brands.get(type));
            loadIndex(resolveIndexPath(type, "names"), names.get(type));
        }
    }

    private void loadIndex(Path filePath, Set<String> target) throws IOException {
        target.clear();
        if (!Files.exists(filePath)) {
            return;
        }

        try (BufferedReader reader = Files.newBufferedReader(filePath, StandardCharsets.UTF_8)) {
            String header = reader.readLine();
            if (header == null) {
                return;
            }
            String line;
            while ((line = reader.readLine()) != null) {
                String value = normalize(unquote(line));
                if (value != null) {
                    target.add(value);
                }
            }
        }
    }

    private void writeIndex(Path filePath, String header, Set<String> values) throws IOException {
        Files.createDirectories(filePath.getParent());
        try (BufferedWriter writer = Files.newBufferedWriter(filePath, StandardCharsets.UTF_8)) {
            writer.write(header);
            writer.newLine();
            for (String value : values) {
                writer.write(toCsvField(value));
                writer.newLine();
            }
        }
    }

    private void appendLine(Path filePath, String value) {
        try {
            Files.createDirectories(filePath.getParent());
            if (!Files.exists(filePath)) {
                String header = filePath.getFileName().toString().contains("brands") ? "brand" : "medicine_name";
                try (BufferedWriter writer = Files.newBufferedWriter(filePath, StandardCharsets.UTF_8)) {
                    writer.write(header);
                    writer.newLine();
                }
            }
            try (BufferedWriter writer = Files.newBufferedWriter(
                    filePath,
                    StandardCharsets.UTF_8,
                    StandardOpenOption.APPEND)) {
                writer.write(toCsvField(value));
                writer.newLine();
            }
        } catch (IOException ignored) {
            // Best effort write for local index enrichment.
        }
    }

    private Path resolveIndexPath(MedicineType type, String kind) {
        String fileName = "medicines_" + kind + "_" + type.name().toLowerCase(Locale.ROOT) + ".csv";
        return resolveResourcePath(fileName);
    }

    private Path resolveResourcePath(String fileName) {
        Path directPath = Path.of("src/main/resources", fileName);
        if (Files.exists(directPath) || directPath.getParent().toFile().exists()) {
            return directPath;
        }
        Path modulePath = Path.of("medicine-service", "src", "main", "resources", fileName);
        if (Files.exists(modulePath) || modulePath.getParent().toFile().exists()) {
            return modulePath;
        }
        return directPath;
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        if (normalized.isBlank()) {
            return null;
        }
        return normalized;
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

    private String toCsvField(String value) {
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }

    private String unquote(String value) {
        String normalized = value == null ? "" : value.trim();
        if (normalized.startsWith("\"") && normalized.endsWith("\"") && normalized.length() >= 2) {
            normalized = normalized.substring(1, normalized.length() - 1).replace("\"\"", "\"");
        }
        return normalized;
    }
}
