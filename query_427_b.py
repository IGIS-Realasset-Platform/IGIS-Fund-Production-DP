import json
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
    res = supabase.table('iota_capital_stack').select('institution_name, amount_krw_100m').eq('vehicle_name', '427').eq('tranche_name', 'Tr.B').execute()
    print("427 Tr.B rows:", res.data)
    print("Sum:", sum(r['amount_krw_100m'] for r in res.data))

query()
