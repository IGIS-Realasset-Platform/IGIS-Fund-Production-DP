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
res = supabase.table("iota_capital_stack").select("*").eq("vehicle_name", "427").execute()

total = 0
print("Amounts for 427:")
for item in res.data:
    amt = item.get('amount_krw_100m', 0)
    print(f"- {item.get('tranche_name')}: {item.get('institution_name')} = {amt}")
    total += amt

print(f"\nTotal: {total}")
