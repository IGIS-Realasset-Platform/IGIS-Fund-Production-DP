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
    res = supabase.table('iota_capital_stack').select('*').eq('vehicle_name', '427').ilike('institution_name', '%신한투자증권%').execute()
    for r in res.data:
        print(f"{r['institution_name']}: {r['amount_krw_100m']} ({r['tranche_name']})")
    
query()
