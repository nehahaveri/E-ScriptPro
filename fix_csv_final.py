import re

csv_path = "medicine-service/src/main/resources/medicines_clean.csv"

with open(csv_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Patterns - order matters! More specific first.
# Match keyword in medicine name, classify accordingly
rules = [
    # Capsule anywhere in name
    (re.compile(r'\bCapsule\b', re.IGNORECASE), 'CAPSULE'),
    # Suspension anywhere in name
    (re.compile(r'\bSuspension\b', re.IGNORECASE), 'SUSPENSION'),
    # Ointment anywhere in name
    (re.compile(r'\bOintment\b', re.IGNORECASE), 'OINTMENT'),
    # Cream at end or as dosage form (not "Ice Cream" flavor)
    (re.compile(r'(?<!Ice\s)\bCream\s*$', re.IGNORECASE), 'CREAM'),
    (re.compile(r'(?<!Ice\s)\bCream\b(?!.*(?:Syrup|Suspension|Ice))', re.IGNORECASE), 'CREAM'),
    # Lotion anywhere
    (re.compile(r'\bLotion\b', re.IGNORECASE), 'LOTION'),
    # Gel - only standalone "Gel" at end of name (topical), not "Gel Mint Sugar Free" etc (oral)
    (re.compile(r'\bGel\s*$', re.IGNORECASE), 'GEL'),
    # Gel with topical context
    (re.compile(r'\bGel\b(?!.*(?:Sugar Free|Mint|Orange|Saunf|Mango|Lemon|Mixed|Oral|Suspension|Syrup))', re.IGNORECASE), 'GEL'),
    # Injection
    (re.compile(r'\bInjection\b', re.IGNORECASE), 'INJECTION'),
    # Syrup
    (re.compile(r'\bSyrup\b', re.IGNORECASE), 'SYRUP'),
]

# Known false positive brands to skip (contain keywords in brand name but aren't that type)
false_positive_brands = re.compile(r'Creamee|Creamet|Amlotion', re.IGNORECASE)

counts = {}
new_lines = [lines[0]]

for line in lines[1:]:
    line_stripped = line.rstrip('\r\n')
    if not line_stripped.strip():
        continue
    parts = line_stripped.rsplit('","', 1)
    if len(parts) != 2:
        new_lines.append(line_stripped + '\n')
        continue
    name_part = parts[0]
    type_part = parts[1].rstrip('"')
    name_clean = name_part.strip('"')

    new_type = type_part

    # Skip false positive brands
    if not false_positive_brands.search(name_clean):
        for pattern, target_type in rules:
            if pattern.search(name_clean):
                new_type = target_type
                break

    if new_type != type_part:
        counts[f"{type_part}->{new_type}"] = counts.get(f"{type_part}->{new_type}", 0) + 1

    new_lines.append(f'{name_part}","{new_type}"\n')

with open(csv_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Transitions:")
for k, v in sorted(counts.items()):
    print(f"  {k}: {v}")
print(f"Total lines: {len(new_lines)}")

