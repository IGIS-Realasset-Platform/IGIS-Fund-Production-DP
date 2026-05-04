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

response = supabase.table("iota_capital_stack").select("*").execute()

items = [item for item in response.data if str(item['vehicle_name']) == '427' and item['phase'] == 'Refinancing' and item['tranche_type'] == 'Equity']
print(f"Total Refinancing Equity rows for 427: {len(items)}")
for item in items:
    print(f"Inst: {item['institution_name']}")
