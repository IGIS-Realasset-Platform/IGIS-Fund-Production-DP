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

names_to_replace = ['대성유화학주식회사', '대원유화학주식회사']
new_name = '에셀유한회사'

for old_name in names_to_replace:
    try:
        res = supabase.table('iota_capital_stack').update({'institution_name': new_name}).eq('institution_name', old_name).execute()
        print(f"Updated '{old_name}' -> '{new_name}'. Modified {len(res.data)} records.")
    except Exception as e:
        print(f"Error updating {old_name}: {e}")

