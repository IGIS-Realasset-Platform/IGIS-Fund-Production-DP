import os
from supabase import create_client

def run():
    url = None
    key = None
    with open('.env.local', 'r') as f:
        for line in f:
            if 'VITE_SUPABASE_URL=' in line:
                url = line.split('=')[1].strip()
            if 'VITE_SUPABASE_ANON_KEY=' in line:
                key = line.split('=')[1].strip()
    
    supabase = create_client(url, key)
    
    # 1. Fetch Bridge '주주대여금' records
    res = supabase.table('iota_capital_stack').select('*').eq('vehicle_name', '816').eq('phase', 'Bridge').eq('tranche_name', '주주대여금').execute()
    
    records = res.data
    new_records = []
    for r in records:
        new_record = {k: v for k, v in r.items() if k not in ['id', 'created_at']}
        new_record['phase'] = 'Refinancing'
        new_records.append(new_record)
        
    if new_records:
        ins_res = supabase.table('iota_capital_stack').insert(new_records).execute()
        print(f"Inserted {len(ins_res.data)} records for Refinancing 주주대여금.")
    else:
        print("No records found to copy.")

run()
