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
    res = supabase.table('iota_capital_stack').select('institution_name, amount_krw_100m, tranche_name').eq('vehicle_name', '427').execute()
    for r in res.data:
        if r['tranche_name'] in ['Tr.A', 'Tr.C', 'Tr.D', '1종 종류주 등', '보통주', '주주대여금'] and "신한" in r['institution_name']:
            print(r)
    
query()
