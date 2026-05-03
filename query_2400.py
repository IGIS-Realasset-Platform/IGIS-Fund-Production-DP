import json
import os
from supabase import create_client

def query():
    url = None
    key = None
    with open('.env.local', 'r') as f:
        for line in f:
            if 'VITE_SUPABASE_URL=' in line:
                url = line.split('=')[1].strip()
            if 'VITE_SUPABASE_ANON_KEY=' in line:
                key = line.split('=')[1].strip()
    
    supabase = create_client(url, key)
    res = supabase.table('iota_capital_stack').select('*').eq('amount_krw_100m', 2400).execute()
    
    print(json.dumps(res.data, indent=2, ensure_ascii=False))

query()
