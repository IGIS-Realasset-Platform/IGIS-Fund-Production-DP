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
res = supabase.table("iota_capital_stack").select("tranche_name, amount_krw_100m").eq("vehicle_name", "427").execute()
sums = {}
for item in res.data:
    t = item.get('tranche_name')
    amt = item.get('amount_krw_100m', 0)
    sums[t] = sums.get(t, 0) + amt
for t, s in sums.items():
    print(f"{t}: {s}")
