import pandas as pd
from supabase import create_client
import os

file_path = "/Users/jkjeon2025/Library/Mobile Documents/com~apple~CloudDocs/JK x IGIS/기획추진/IFPDP/IOTA Seoul/IOTA Seoul 펀드 구조_Bridge stage.xlsx"
df = pd.read_excel(file_path, sheet_name=0) # First sheet

# Collect names from column '대주' (or whatever column has the names)
names_in_excel = set()
for col in df.columns:
    for val in df[col].dropna().unique():
        if isinstance(val, str) and len(val) > 1:
            names_in_excel.add(val.strip().replace('\n', ''))

url = None
key = None
if os.path.exists('.env.local'):
    with open('.env.local', 'r') as f:
        for line in f:
            if 'VITE_SUPABASE_URL=' in line:
                url = line.split('=')[1].strip()
            if 'VITE_SUPABASE_ANON_KEY=' in line:
                key = line.split('=')[1].strip()

supabase = create_client(url, key)
res = supabase.table('iota_capital_stack').select('id, institution_name').execute()

db_names = set()
for r in res.data:
    db_names.add(r['institution_name'])

print("--- DB Names vs Potential Matches in Excel ---")
for db_name in sorted(db_names):
    # simple match logic for display
    print(db_name)

print("\n--- All string values in Excel (for reference) ---")
print(sorted(list(names_in_excel)))

