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
    res = supabase.table('iota_capital_stack').select('amount_krw_100m, institution_name').eq('vehicle_name', '427').eq('tranche_name', 'Tr.B').execute()
    total = sum([r['amount_krw_100m'] for r in res.data])
    print(f"Total Tr.B in DB: {total} 억")
    for r in res.data:
        if '신협' in r['institution_name'] or '단위' in r['institution_name']:
            print(f"  {r['institution_name']}: {r['amount_krw_100m']}")

query()
