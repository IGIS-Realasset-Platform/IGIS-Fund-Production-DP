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

response = supabase.table("iota_capital_stack").select("*").eq("vehicle_name", "427").eq("phase", "Bridge").execute()

equity_sum = sum(item['amount_krw_100m'] for item in response.data if item['tranche_type'] == 'Equity')
loan_sum = sum(item['amount_krw_100m'] for item in response.data if item['tranche_type'] == 'Loan')

print(f"427 Bridge - Equity: {equity_sum} 억원")
print(f"427 Bridge - Loan: {loan_sum} 억원")
