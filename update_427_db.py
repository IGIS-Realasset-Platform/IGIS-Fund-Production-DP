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

# 1. Update existing 427 'Current' to 'Bridge'
res = supabase.table('iota_capital_stack').update({'phase': 'Bridge'}).eq('vehicle_name', '427').eq('phase', 'Current').execute()
print(f"Updated {len(res.data)} records to Bridge for 427")

# 2. Fetch Equity from Bridge to copy over
res_eq = supabase.table('iota_capital_stack').select('*').eq('vehicle_name', '427').eq('phase', 'Bridge').in_('tranche_type', ['Equity']).execute()

new_records = []
# Add Equity
for r in res_eq.data:
    new_r = r.copy()
    del new_r['id']
    new_r['phase'] = 'Refinancing'
    new_records.append(new_r)

# Add Loans
loans = [
    {'tranche_name': 'Tr.A-1', 'tranche_type': 'Loan', 'amount': 11450},
    {'tranche_name': 'Tr.A-2', 'tranche_type': 'Loan', 'amount': 1550},
    {'tranche_name': 'Tr.B-1', 'tranche_type': 'Loan', 'amount': 6350},
    {'tranche_name': 'Tr.B-2', 'tranche_type': 'Loan', 'amount': 650},
    {'tranche_name': 'Tr.C', 'tranche_type': 'Loan', 'amount': 2000},
]

for l in loans:
    new_records.append({
        'vehicle_name': '427',
        'phase': 'Refinancing',
        'tranche_name': l['tranche_name'],
        'tranche_type': l['tranche_type'],
        'institution_name': 'TBD',
        'amount_krw_100m': l['amount']
    })

# First delete any existing Refinancing for 427 just in case
supabase.table('iota_capital_stack').delete().eq('vehicle_name', '427').eq('phase', 'Refinancing').execute()

# Insert new records
res_ins = supabase.table('iota_capital_stack').insert(new_records).execute()
print(f"Inserted {len(res_ins.data)} records for 427 Refinancing")

