import os
import json
from supabase import create_client

url = None
key = None
with open(".env.local") as f:
    for line in f:
        if line.startswith("VITE_SUPABASE_URL="):
            url = line.strip().split("=")[1].strip("'\"")
        elif line.startswith("VITE_SUPABASE_ANON_KEY="):
            key = line.strip().split("=")[1].strip("'\"")

supabase = create_client(url, key)
res = supabase.table("counterparties").select("counterparty_id").ilike("name", "%국민연금%").execute()
if len(res.data) > 0:
    cp_ids = [c["counterparty_id"] for c in res.data]
    contacts = supabase.table("counterparty_contacts").select("name, title, department, email, mobile, created_at").in_("counterparty_id", cp_ids).execute()
    print(json.dumps(contacts.data, ensure_ascii=False, indent=2))
else:
    print("No NPS counterparties found")
