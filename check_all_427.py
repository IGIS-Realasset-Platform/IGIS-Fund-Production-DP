import os
from supabase import create_client, Client

url = ""
key = ""
with open('.env.local', 'r') as f:
    for line in f:
        if line.startswith('VITE_SUPABASE_URL='):
            url = line.strip().split('=')[1]
        elif line.startswith('VITE_SUPABASE_ANON_KEY='):
            key = line.strip().split('=')[1]

supabase: Client = create_client(url, key)

response = supabase.table("iota_capital_stack").select("*").eq("vehicle_name", "427").execute()

for item in response.data:
    print(f"Inst: {item['institution_name']}, Phase: {item['phase']}, Tranche: {item['tranche_type']}, Amount: {item['amount_krw_100m']}")

