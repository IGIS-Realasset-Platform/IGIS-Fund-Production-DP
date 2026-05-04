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
res = supabase.table("beneficiary_exposures").select("*").limit(1).execute()
if len(res.data) > 0:
    print(res.data[0].keys())
