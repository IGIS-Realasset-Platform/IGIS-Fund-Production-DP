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
    
    # Insert 신협중앙회 150 for 427 Tr.B
    data = {
        "vehicle_name": "427",
        "phase": "Current",
        "tranche_name": "Tr.B",
        "tranche_type": "Loan",
        "institution_name": "신협중앙회",
        "amount_krw_100m": 150.0
    }
    
    supabase.table('iota_capital_stack').insert(data).execute()
    print("Restored 신협중앙회 150.0 to 427 Tr.B")
    
query()
