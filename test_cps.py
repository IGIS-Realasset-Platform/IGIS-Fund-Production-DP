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
cps = supabase.table("counterparties").select("counterparty_id, name, category").execute().data
exps = supabase.table("beneficiary_exposures").select("counterparty_id, committed_amt").execute().data

amounts = {}
for ex in exps:
    cp_id = ex.get('counterparty_id')
    amt = ex.get('committed_amt')
    if cp_id and amt:
        amounts[cp_id] = amounts.get(cp_id, 0) + int(amt)

others = []
for cp in cps:
    cp_id = cp.get('counterparty_id')
    amt = amounts.get(cp_id, 0)
    if amt > 0:
        cp['total_amt'] = amt
        others.append(cp)

others.sort(key=lambda x: x['total_amt'], reverse=True)
print(f"Total others with amount > 0: {len(others)}")
for o in others[:5]:
    print(o)
