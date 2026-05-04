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
res = supabase.table("counterparty_contacts").select("*").ilike("name", "%129조원%").execute()
print(f"Name match: {len(res.data)}")
if len(res.data) > 0: print(res.data)

res2 = supabase.table("counterparty_contacts").select("*").ilike("department", "%5075%").execute()
print(f"Dept match: {len(res2.data)}")
if len(res2.data) > 0: print(res2.data)
