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
cps = supabase.table("counterparties").select("counterparty_id").ilike("name", "%신한은행%").execute()
if len(cps.data) > 0:
    cp_ids = [c["counterparty_id"] for c in cps.data]
    res = supabase.table("counterparty_contacts").select("*").in_("counterparty_id", cp_ids).execute()
    for r in res.data[:5]:
        print(r)
else:
    print("No counterparties found")
