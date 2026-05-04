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

response = supabase.table("iota_capital_stack").select("*").eq("vehicle_name", "427").execute()

count = sum(1 for item in response.data if item['institution_name'] == '이지스421호')
print(f"Count of 이지스421호 for 427: {count}")

