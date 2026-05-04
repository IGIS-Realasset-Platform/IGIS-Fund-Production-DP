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
cps = supabase.table("counterparties").select("counterparty_id").ilike("name", "%농업협동조합중앙회%").execute()
if len(cps.data) > 0:
    cp_ids = [c["counterparty_id"] for c in cps.data]
    res = supabase.table("counterparty_contacts").select("*").in_("counterparty_id", cp_ids).execute()
    for r in res.data:
        print(f"Name: {r.get('name')}")
        print(f"Title: {r.get('title')}")
        print(f"Dept: {r.get('department')}")
        print(f"Email: {r.get('email')}")
        print(f"Mobile: {r.get('mobile')}")
        print("---")
else:
    print("No counterparties found")
