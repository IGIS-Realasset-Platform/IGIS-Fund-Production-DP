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
exps = supabase.table("beneficiary_exposures").select("*").execute().data
amounts = {}
for e in exps:
    name = e.get("beneficiary_clean")
    amt = e.get("committed_amt")
    if name and amt:
        amounts[name] = amounts.get(name, 0) + int(amt)

print("Top 10 by name:")
for k, v in sorted(amounts.items(), key=lambda x: x[1], reverse=True)[:10]:
    print(k, v)
