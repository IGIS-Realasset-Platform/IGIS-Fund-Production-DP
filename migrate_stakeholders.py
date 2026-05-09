import os
import urllib.request
import json
import urllib.parse

# Read .env.local
env = {}
with open('.env.local', 'r') as f:
    for line in f:
        if '=' in line:
            key, val = line.strip().split('=', 1)
            env[key] = val

url_base = env.get('VITE_SUPABASE_URL')
api_key = env.get('VITE_SUPABASE_ANON_KEY')

cells = {
    '전기영': '기획추진', '이시정': '기획추진', '이관용': '기획추진',
    '이철승': 'CFT 총괄', '윤관식': 'CFT 총괄', '정조민': 'CFT 총괄', '우형석': 'CFT 총괄',
    '권순일': '사업PM', '강순용': '사업PM', '윤주형': '사업PM', '김제익': '사업PM', '류홍': '사업PM', '박만진': '사업PM', '박일훈': '사업PM', '이정원': '사업PM', '전무경': '사업PM', '한찬호': '사업PM', '박석제': '사업PM', '박채현': '사업PM', '소현준': '사업PM', '이수정': '사업PM', '조영비': '사업PM', '한수정': '사업PM',
    '박준호': '파이낸싱-LFC', '강석민': '파이낸싱-LFC', '정리훈': '파이낸싱-LFC', '손유정': '파이낸싱-LFC', '김지우': '파이낸싱-LFC', '박현승': '파이낸싱-LFC', '이성민A': '파이낸싱-LFC', '한승환': '파이낸싱-LFC',
    '홍장군': '개발관리', '채원': '개발관리', '김보성': '개발관리', '전승희': '개발관리', '김대익': '개발관리', '장성진': '개발관리', '이정훈': '개발관리', '박봉서': '개발관리',
    '김민지': '기업마케팅', '고아라': '기업마케팅',
    '김현수': '상품·디지털', '현철호': '상품·디지털', '신민호': '상품·디지털', '이가현': '상품·디지털', '정수명': '상품·디지털',
    '김행단': '펀드운용', '윤용택': 'IPR'
}

for name, role in cells.items():
    print(f"Updating {name} to {role}...")
    encoded_name = urllib.parse.quote(name)
    url = f"{url_base}/rest/v1/iota_stakeholder_master?contact_name=eq.{encoded_name}"
    
    data = json.dumps({"role_category": role}).encode('utf-8')
    req = urllib.request.Request(url, data=data, method='PATCH')
    req.add_header('apikey', api_key)
    req.add_header('Authorization', f'Bearer {api_key}')
    req.add_header('Content-Type', 'application/json')
    req.add_header('Prefer', 'return=minimal')
    
    try:
        with urllib.request.urlopen(req) as response:
            pass
    except Exception as e:
        print(f"Error for {name}: {e}")

print("Done")
