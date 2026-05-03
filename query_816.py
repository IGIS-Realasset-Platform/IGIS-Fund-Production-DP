import json
import os
from supabase import create_client

def query():
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
    res = supabase.table('iota_capital_stack').select('tranche_name, tranche_type, phase, amount_krw_100m').eq('vehicle_name', '816').execute()
    
    # Just print unique tranches
    tranches = {}
    for r in res.data:
        t = f"{r['phase']} - {r['tranche_type']} - {r['tranche_name']}"
        tranches[t] = tranches.get(t, 0) + r['amount_krw_100m']
    
    for k, v in tranches.items():
        print(f"{k}: {v}")

query()
