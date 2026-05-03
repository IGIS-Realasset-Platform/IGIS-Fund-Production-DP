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
tables_to_test = ['asset_info', 'vehicle_metrics', 'iota_seoul_info', 'metrics', 'dashboard_metrics', 'vehicle_details', 'vehicle_summary']

for t in tables_to_test:
    try:
        res = supabase.table(t).select('*').limit(1).execute()
        print(f"Table '{t}' EXISTS! Sample:", res.data)
    except Exception as e:
        if 'does not exist' not in str(e) and 'schema cache' not in str(e):
            print(f"Table '{t}' error: {e}")
