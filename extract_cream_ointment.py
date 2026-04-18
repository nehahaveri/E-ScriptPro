import csv

raw = 'medicine-service/src/main/resources/raw_medicine.csv'
clean = 'medicine-service/src/main/resources/medicines_clean.csv'

cream_entries = set()
ointment_entries = set()

with open(raw, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        name = (row.get('brand_name') or '').strip()
        form = (row.get('dosage_form') or '').strip().lower()
        if not name:
            continue
        name_lower = name.lower()
        if 'ice cream' in name_lower:
            continue
        if form == 'cream' or ('cream' in name_lower and 'creamee' not in name_lower and 'creamet' not in name_lower):
            cream_entries.add(name)
        elif form == 'ointment' or 'ointment' in name_lower:
            ointment_entries.add(name)

with open(clean, 'a', encoding='utf-8') as f:
    for name in sorted(cream_entries):
        f.write('"' + name.replace('"', '""') + '","CREAM"\n')
    for name in sorted(ointment_entries):
        f.write('"' + name.replace('"', '""') + '","OINTMENT"\n')

print(f'Added {len(cream_entries)} CREAM entries')
print(f'Added {len(ointment_entries)} OINTMENT entries')

