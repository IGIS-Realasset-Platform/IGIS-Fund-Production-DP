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
    res = supabase.table('iota_capital_stack').select('tranche_name, tranche_type, amount_krw_100m').eq('vehicle_name', '427').execute()
    sums = {}
    for r in res.data:
        t = r['tranche_name']
        sums[t] = sums.get(t, 0) + r['amount_krw_100m']
    print("427 sums:", sums)
    print("427 total Loan:", sum([v for k,v in sums.items() if 'Tr.' in k]))

query()
