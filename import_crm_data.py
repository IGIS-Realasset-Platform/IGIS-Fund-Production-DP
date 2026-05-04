import pandas as pd
import math
from supabase import create_client
import re
from datetime import datetime

url = None
key = None
with open(".env.local") as f:
    for line in f:
        if line.startswith("VITE_SUPABASE_URL="):
            url = line.strip().split("=")[1].strip("'\"")
        elif line.startswith("VITE_SUPABASE_ANON_KEY="):
            key = line.strip().split("=")[1].strip("'\"")

supabase = create_client(url, key)

file_path = "/Users/jkjeon2025/Library/Mobile Documents/com~apple~CloudDocs/JK x IGIS/기획추진/IFPDP/DB 취합/CM CRM (원드라이브 참고)/Investor List_240826.xlsx"
df = pd.read_excel(file_path, sheet_name=None)

# Get all counterparties to map names to IDs
cps_res = supabase.table("counterparties").select("counterparty_id, name").execute()
cp_map = {c["name"]: c["counterparty_id"] for c in cps_res.data}
cp_alias = {
    "농협중앙회": "농업협동조합중앙회" # Add aliases if needed
}

def clean_val(v):
    if pd.isna(v): return ""
    return str(v).strip()

inserted_count = 0

for sheet_name, sheet_df in df.items():
    # Only process numbered sheets like "1. 국민연금공단"
    match = re.match(r'^(\d+)\.\s*(.+)', sheet_name)
    if not match: continue
    
    inst_name = match.group(2).strip()
    
    # Map to counterparty ID
    db_name = cp_alias.get(inst_name, inst_name)
    # Fuzzy match if exact doesn't exist
    cp_id = cp_map.get(db_name)
    if not cp_id:
        for kname, kid in cp_map.items():
            if inst_name in kname or kname in inst_name:
                cp_id = kid
                break
                
    if not cp_id:
        print(f"Skipping {inst_name} - Not found in DB")
        continue
        
    print(f"Processing {inst_name} (ID: {cp_id})...")
    
    # Delete existing CRM metadata (AUM and history) for this CP to avoid duplicates
    # We won't delete actual contacts (people) if they have a real name and email
    # First, let's get all contacts to see which are metadata
    existing = supabase.table("counterparty_contacts").select("id, name, created_at").eq("counterparty_id", cp_id).execute()
    ids_to_delete = []
    for c in existing.data:
        # Delete if it's AUM info or Meeting Note
        if 'AUM' in c['name'] or '펀드' in c['name'] or len(c['name']) > 15:
            ids_to_delete.append(c['id'])
    
    if ids_to_delete:
        supabase.table("counterparty_contacts").delete().in_("id", ids_to_delete).execute()

    new_records = []
    
    # 1. Extract AUM and Fund Data (Usually in rows 0-5, somewhere in col index 1, 2, or 3)
    for i in range(min(10, len(sheet_df))):
        for col in sheet_df.columns:
            val = clean_val(sheet_df.iloc[i][col])
            if 'AUM' in val or '프로젝트펀드' in val or '위탁운용펀드' in val:
                new_records.append({
                    "counterparty_id": cp_id,
                    "name": val,
                    "title": "",
                    "department": "",
                    "email": "",
                    "mobile": "",
                    "created_at": datetime.utcnow().isoformat()
                })
                
    # 2. Extract Meeting History
    # We look for rows where the first or second column is a datetime
    for i in range(len(sheet_df)):
        row = sheet_df.iloc[i]
        date_val = row.iloc[1] if len(row) > 1 else None # Unnamed: 1 is usually the date
        
        is_date = False
        parsed_date = None
        if isinstance(date_val, datetime):
            is_date = True
            parsed_date = date_val.isoformat()
        elif isinstance(date_val, pd.Timestamp):
            is_date = True
            parsed_date = date_val.isoformat()
        elif isinstance(date_val, str) and re.match(r'^\d{4}-\d{2}-\d{2}', date_val):
            is_date = True
            parsed_date = date_val + "T00:00:00"
            
        if is_date:
            attendees = clean_val(row.iloc[2]) if len(row) > 2 else ""
            igis_attendees = clean_val(row.iloc[3]) if len(row) > 3 else ""
            topic = clean_val(row.iloc[5]) if len(row) > 5 else ""
            contents = clean_val(row.iloc[6]) if len(row) > 6 else ""
            
            # Combine into the fields we have in counterparty_contacts
            # 'name' -> Topic + Contents
            # 'title' -> Attendees
            # 'department' -> IGIS attendees
            # 'created_at' -> The actual meeting date!
            
            note_name = ""
            if topic: note_name += f"[{topic}]\n"
            note_name += contents
            note_name = note_name.strip()
            
            if note_name:
                new_records.append({
                    "counterparty_id": cp_id,
                    "name": note_name,
                    "title": attendees,
                    "department": igis_attendees,
                    "email": "",
                    "mobile": "",
                    "created_at": parsed_date
                })

    if new_records:
        supabase.table("counterparty_contacts").insert(new_records).execute()
        inserted_count += len(new_records)
        print(f"  Inserted {len(new_records)} records")

print(f"\nDone! Inserted {inserted_count} total records.")
