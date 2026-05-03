import os
from supabase import create_client

url = None
key = None
if os.path.exists('.env.local'):
    with open('.env.local', 'r') as f:
        for line in f:
            if 'VITE_SUPABASE_URL=' in line:
                url = line.split('=')[1].strip()
            if 'VITE_SUPABASE_ANON_KEY=' in line:
                key = line.split('=')[1].strip()

supabase = create_client(url, key)

res = supabase.table('iota_capital_stack').select('vehicle_name, phase').ilike('vehicle_name', '%427%').execute()

phases = set()
for r in res.data:
    phases.add((r['vehicle_name'], r['phase']))

print("Found vehicle_name and phase combinations for 427:")
for p in phases:
    print(p)
