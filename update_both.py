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
    
    # --- 1. Fix 427 Tr.B ---
    # First, delete the rows we previously inserted that were wrong.
    # We inserted them for 427 Current Tr.B. We will delete all '신협' and '협동조합' rows for 427 Tr.B to be safe, then insert the correct ones.
    res_427 = supabase.table('iota_capital_stack').select('id, institution_name').eq('vehicle_name', '427').eq('tranche_name', 'Tr.B').execute()
    ids_to_delete = []
    for r in res_427.data:
        if '신협' in r['institution_name'] or '협동조합' in r['institution_name'] or '단위' in r['institution_name']:
            ids_to_delete.append(r['id'])
    
    if ids_to_delete:
        supabase.table('iota_capital_stack').delete().in_('id', ids_to_delete).execute()
        
    data_427 = [
        {"institution_name": "광희 신용협동조합", "amount_krw_100m": 38},
        {"institution_name": "대원 신용협동조합", "amount_krw_100m": 29},
        {"institution_name": "마포 신용협동조합", "amount_krw_100m": 45},
        {"institution_name": "북서울특별시 신용협동조합", "amount_krw_100m": 11},
        {"institution_name": "삼양 신용협동조합", "amount_krw_100m": 31},
        {"institution_name": "서울특별시약사 신용협동조합", "amount_krw_100m": 50},
        {"institution_name": "경기광주 신용협동조합", "amount_krw_100m": 25},
        {"institution_name": "동부 신용협동조합", "amount_krw_100m": 25},
        {"institution_name": "속초 신용협동조합", "amount_krw_100m": 17},
        {"institution_name": "아산 신용협동조합", "amount_krw_100m": 47},
        {"institution_name": "원주 신용협동조합", "amount_krw_100m": 50},
        {"institution_name": "원주제일 신용협동조합", "amount_krw_100m": 8},
        {"institution_name": "원주참빛 신용협동조합", "amount_krw_100m": 12},
        {"institution_name": "횡성 신용협동조합", "amount_krw_100m": 12},
        {"institution_name": "신한투자증권->경남제일 신협", "amount_krw_100m": 40},
        {"institution_name": "신한투자증권->경남마산 신협", "amount_krw_100m": 31},
        {"institution_name": "신한투자증권->창원 신협(->서원경 신협 9.3억)", "amount_krw_100m": 10.7},
        {"institution_name": "신한투자증권->북원 신협", "amount_krw_100m": 39},
        {"institution_name": "신한투자증권->경동 신협", "amount_krw_100m": 25},
        {"institution_name": "신한투자증권->삼익 신협", "amount_krw_100m": 15},
        {"institution_name": "신한투자증권->창원늘푸른 신협(->서원경 신협 1.9억)", "amount_krw_100m": 29},
        {"institution_name": "신한투자증권->광안 신협", "amount_krw_100m": 46},
        {"institution_name": "신한투자증권->울산행복 신협", "amount_krw_100m": 46},
        {"institution_name": "신한투자증권->경남가온 신협", "amount_krw_100m": 8},
        {"institution_name": "신한투자증권->창원/창원늘푸른 신협->서원경 신협", "amount_krw_100m": 10.3}
    ]
    
    insert_427 = []
    for d in data_427:
        insert_427.append({
            "vehicle_name": "427",
            "phase": "Current",
            "tranche_name": "Tr.B",
            "tranche_type": "Loan",
            "institution_name": d["institution_name"],
            "amount_krw_100m": d["amount_krw_100m"]
        })
    supabase.table('iota_capital_stack').insert(insert_427).execute()
    print(f"Inserted {len(insert_427)} rows for 427.")
    
    # --- 2. Fix 816 Bridge Tr.A ---
    supabase.table('iota_capital_stack').delete().eq('vehicle_name', '816').eq('phase', 'Bridge').eq('tranche_name', 'Tr.A').eq('institution_name', '하나대체투자자산운용 펀드').execute()
    
    data_816 = [
        {"institution_name": "서천신용협동조합", "amount_krw_100m": 25},
        {"institution_name": "수지신용협동조합", "amount_krw_100m": 35},
        {"institution_name": "대구대건신용협동조합", "amount_krw_100m": 30},
        {"institution_name": "주민신용협동조합", "amount_krw_100m": 30},
        {"institution_name": "강릉신용협동조합", "amount_krw_100m": 15},
        {"institution_name": "서귀포동부신용협동조합", "amount_krw_100m": 15},
        {"institution_name": "부산진신용협동조합", "amount_krw_100m": 25},
        {"institution_name": "등촌신용협동조합", "amount_krw_100m": 25},
        {"institution_name": "이천신용협동조합", "amount_krw_100m": 25},
        {"institution_name": "제주중앙신용협동조합", "amount_krw_100m": 25},
        {"institution_name": "문창신용협동조합", "amount_krw_100m": 20},
        {"institution_name": "회원신용협동조합", "amount_krw_100m": 20}
    ]
    
    insert_816 = []
    for d in data_816:
        insert_816.append({
            "vehicle_name": "816",
            "phase": "Bridge",
            "tranche_name": "Tr.A",
            "tranche_type": "Loan",
            "institution_name": d["institution_name"],
            "amount_krw_100m": d["amount_krw_100m"]
        })
    supabase.table('iota_capital_stack').insert(insert_816).execute()
    print(f"Inserted {len(insert_816)} rows for 816.")
    
    # Rename IM뱅크 to 대구은행, IM캐피탈 to DGB캐피탈
    supabase.table('iota_capital_stack').update({'institution_name': '대구은행'}).eq('vehicle_name', '816').eq('phase', 'Bridge').eq('institution_name', 'IM뱅크').execute()
    supabase.table('iota_capital_stack').update({'institution_name': 'DGB캐피탈'}).eq('vehicle_name', '816').eq('phase', 'Bridge').eq('institution_name', 'IM캐피탈').execute()
    
    # Rename 뉴스타케미 to 뉴스타케미제일차(전기공사공제회)
    supabase.table('iota_capital_stack').update({'institution_name': '뉴스타케미제일차(전기공사공제회)'}).eq('vehicle_name', '816').eq('phase', 'Bridge').eq('institution_name', '뉴스타케미(전기공사공제회)').execute()

query()
