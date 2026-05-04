import os
from supabase import create_client, Client

url = ""
key = ""
with open('.env.local', 'r') as f:
    for line in f:
        if line.startswith('VITE_SUPABASE_URL='):
            url = line.strip().split('=')[1]
        elif line.startswith('VITE_SUPABASE_ANON_KEY='):
            key = line.strip().split('=')[1]

supabase: Client = create_client(url, key)

response = supabase.table("iota_capital_stack").select("*").execute()

sum_816_bridge_eq = sum(item['amount_krw_100m'] for item in response.data if str(item['vehicle_name']) == '816' and item['phase'] == 'Bridge' and item['tranche_type'] == 'Equity')
sum_816_bridge_ln = sum(item['amount_krw_100m'] for item in response.data if str(item['vehicle_name']) == '816' and item['phase'] == 'Bridge' and item['tranche_type'] == 'Loan')

sum_816_refi_eq = sum(item['amount_krw_100m'] for item in response.data if str(item['vehicle_name']) == '816' and item['phase'] == 'Refinancing' and item['tranche_type'] == 'Equity')
sum_816_refi_ln = sum(item['amount_krw_100m'] for item in response.data if str(item['vehicle_name']) == '816' and item['phase'] == 'Refinancing' and item['tranche_type'] == 'Loan')

print(f"816 Bridge - Eq: {sum_816_bridge_eq}, Ln: {sum_816_bridge_ln}")
print(f"816 Refi - Eq: {sum_816_refi_eq}, Ln: {sum_816_refi_ln}")

sum_421_eq = sum(item['amount_krw_100m'] for item in response.data if str(item['vehicle_name']) == '421' and item['tranche_type'] == 'Equity')
sum_421_ln = sum(item['amount_krw_100m'] for item in response.data if str(item['vehicle_name']) == '421' and item['tranche_type'] == 'Loan')
print(f"421 - Eq: {sum_421_eq}, Ln: {sum_421_ln}")

