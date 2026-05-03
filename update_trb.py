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
    
    # Delete '단위신협 연합'
    res = supabase.table('iota_capital_stack').delete().eq('vehicle_name', '427').eq('tranche_name', 'Tr.B').eq('institution_name', '단위신협 연합').execute()
    
    # Data to insert
    data = [
        {"institution_name": "강속 신용협동조합", "amount_krw_100m": 38},
        {"institution_name": "대관 신용협동조합", "amount_krw_100m": 29},
        {"institution_name": "대오 신용협동조합", "amount_krw_100m": 45},
        {"institution_name": "북서울 신용협동조합", "amount_krw_100m": 11},
        {"institution_name": "상무 신용협동조합", "amount_krw_100m": 31},
        {"institution_name": "서울남부 신용협동조합", "amount_krw_100m": 50},
        {"institution_name": "상가금고 신용협동조합", "amount_krw_100m": 25},
        {"institution_name": "동부 신용협동조합", "amount_krw_100m": 25},
        {"institution_name": "속초 신용협동조합", "amount_krw_100m": 17},
        {"institution_name": "아산 신용협동조합", "amount_krw_100m": 47},
        {"institution_name": "영수 신용협동조합", "amount_krw_100m": 50},
        {"institution_name": "원주제일 신용협동조합", "amount_krw_100m": 8},
        {"institution_name": "원주중앙 신용협동조합", "amount_krw_100m": 12},
        {"institution_name": "횡성 신용협동조합", "amount_krw_100m": 12},
        {"institution_name": "신한투자증권->경남창원 신협", "amount_krw_100m": 40},
        {"institution_name": "신한투자증권->경남다산 신협", "amount_krw_100m": 31},
        {"institution_name": "신한투자증권->창원 신협(->서원경 신협)", "amount_krw_100m": 10.7},
        {"institution_name": "신한투자증권->목원 신협", "amount_krw_100m": 33},
        {"institution_name": "신한투자증권->경동 신협", "amount_krw_100m": 25},
        {"institution_name": "신한투자증권->삼익 신협", "amount_krw_100m": 15},
        {"institution_name": "신한투자증권->창원늘푸른 신협(->서원경 신협)", "amount_krw_100m": 28},
        {"institution_name": "신한투자증권->광안 신협", "amount_krw_100m": 46},
        {"institution_name": "신한투자증권->창원행복 신협", "amount_krw_100m": 46},
        {"institution_name": "신한투자증권->경남가장 신협", "amount_krw_100m": 8},
        {"institution_name": "신한투자증권->진주상평 신협(->서원경 신협)", "amount_krw_100m": 10.3}
    ]
    
    insert_data = []
    for d in data:
        insert_data.append({
            "vehicle_name": "427",
            "phase": "Current",
            "tranche_name": "Tr.B",
            "tranche_type": "Loan",
            "institution_name": d["institution_name"],
            "amount_krw_100m": d["amount_krw_100m"]
        })
    
    res = supabase.table('iota_capital_stack').insert(insert_data).execute()
    print(f"Inserted {len(insert_data)} rows.")

query()
