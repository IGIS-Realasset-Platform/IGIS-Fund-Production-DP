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

res = supabase.table('iota_capital_stack').select('phase, tranche_name, tranche_type, institution_name, amount_krw_100m').eq('vehicle_name', '427').execute()

print(f"Total 427 records: {len(res.data)}")
summary = {}
total_amount = 0

for r in res.data:
    phase = r.get('phase', 'N/A')
    t_name = r.get('tranche_name')
    t_type = r.get('tranche_type')
    amt = r.get('amount_krw_100m') or 0
    total_amount += amt
    
    key = f"[{phase}] {t_name} ({t_type})"
    if key not in summary:
        summary[key] = {'total': 0, 'institutions': []}
    
    summary[key]['total'] += amt
    summary[key]['institutions'].append(f"{r.get('institution_name')}: {amt}억")

print(f"\n--- 427 PFV Capital Stack Summary (Total: {total_amount}억) ---")
for k, v in summary.items():
    print(f"\n{k} - 합계: {v['total']}억")
    for inst in v['institutions']:
        print(f"  - {inst}")

