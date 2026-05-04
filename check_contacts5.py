import os
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
cps = supabase.table("counterparties").select("counterparty_id, name").ilike("name", "%농업협동%").execute()
print(f"Counterparties found: {cps.data}")

if len(cps.data) > 0:
    cp_ids = [c["counterparty_id"] for c in cps.data]
    res = supabase.table("counterparty_contacts").select("*").in_("counterparty_id", cp_ids).execute()
    print(f"Contacts found: {len(res.data)}")
    for r in res.data:
        print(f"Name: {r.get('name')}")
        print(f"Title: {r.get('title')}")
