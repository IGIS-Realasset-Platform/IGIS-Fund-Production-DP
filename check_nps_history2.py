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
res = supabase.table("counterparties").select("counterparty_id, name").ilike("name", "%NPS%").execute()
print(f"NPS: {res.data}")
res2 = supabase.table("counterparties").select("counterparty_id, name").ilike("name", "%국민연금%").execute()
print(f"국민연금: {res2.data}")

# check if there are any contacts with name or title containing 국민연금
res3 = supabase.table("counterparty_contacts").select("name, title").ilike("name", "%국민연금%").execute()
print(f"Contacts with 국민연금 in name: {len(res3.data)}")

# check if there are any contacts with name or title containing 미팅 or 회의
res4 = supabase.table("counterparty_contacts").select("name").ilike("name", "%국민%").execute()
print(f"Contacts with 국민 in name: {len(res4.data)}")
