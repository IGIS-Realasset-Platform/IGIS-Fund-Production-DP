# -*- coding: utf-8 -*-
import requests
import re
import os
import time
import json
import random

def load_env():
    env = {}
    for filename in ['.env.local', '.env']:
        if os.path.exists(filename):
            with open(filename, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        parts = line.split('=', 1)
                        env[parts[0].strip()] = parts[1].strip()
    return env

env = load_env()
supabase_url = env.get("VITE_SUPABASE_URL")
supabase_key = env.get("VITE_SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    print("Error: Supabase config not found in .env files.")
    exit(1)

headers_base = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json"
}

client_headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": "https://officefind.co.kr/"
}

def get_name_candidates(raw_name):
    """
    Generate fallback building names to handle complex parenthesized expressions
    e.g. 'KAIT Tower(카이트타워) (구, 토마토빌딩)' -> ['KAIT Tower', '카이트타워', 'KAIT타워']
    """
    candidates = []
    
    # 1. Pure original clean name (remove parentheses completely)
    clean_name = re.sub(r'\(.*?\)', '', raw_name).strip()
    if clean_name and clean_name not in candidates:
        candidates.append(clean_name)
        
    # 2. Extract Korean name inside the first parenthesis
    paren_match = re.search(r'\((.*?)\)', raw_name)
    if paren_match:
        paren_content = paren_match.group(1).strip()
        # Remove '구, ' prefix if exists
        paren_content = re.sub(r'^구,\s*', '', paren_content).strip()
        if paren_content and paren_content not in candidates:
            candidates.append(paren_content)
            
    # 3. Handle English/Korean hybrids like 'KAIT Tower' -> 'KAIT타워'
    if "Tower" in clean_name:
        tower_kor = clean_name.replace("Tower", "타워").replace(" ", "")
        if tower_kor not in candidates:
            candidates.append(tower_kor)
            
    # 4. Raw name itself as fallback
    if raw_name not in candidates:
        candidates.append(raw_name)
        
    return candidates

def parse_officefind_details(html):
    """
    Parse standard floor area, HVAC type, and subway access from OfficeFind HTML
    """
    standard_floor_area_py = None
    hvac_type = None
    subway_access = None
    
    # 1. Parse standard floor area (임대 기준층 면적)
    td_match = re.search(r'<th>기준층 면적</th>\s*<td>(.*?)</td>', html, re.DOTALL)
    if td_match:
        td_html = td_match.group(1)
        # Find first data-py in the td (which is rental area)
        py_match = re.search(r'data-py="([^"]*)"', td_html)
        if py_match:
            try:
                standard_floor_area_py = float(py_match.group(1))
            except ValueError:
                pass
                
    # 2. Parse HVAC type (냉난방 방식)
    hvac_match = re.search(r'<th>냉난방</th>\s*<td>(.*?)</td>', html, re.DOTALL)
    if hvac_match:
        hvac_type = hvac_match.group(1).strip()
        
    # 3. Parse Subway access (지하철 접근성)
    subway_match = re.search(r'<th>지하철역</th>\s*<td>(.*?)</td>', html, re.DOTALL)
    if subway_match:
        subway_access = subway_match.group(1).strip()
        
    return standard_floor_area_py, hvac_type, subway_access

def main():
    # Fetch assets from Supabase where standard_floor_area_py is NULL
    url = f"{supabase_url}/rest/v1/office_assets?select=id,name,dong,parcel_main,parcel_sub,custom_metadata,completion_date,far_pct,efficiency_pct&standard_floor_area_py=is.null&limit=80"
    
    r = requests.get(url, headers=headers_base)
    if r.status_code != 200:
        print(f"Error fetching assets from Supabase: {r.text}")
        return
        
    assets = r.json()
    print(f"Loaded {len(assets)} assets with missing standard floor area.")
    
    success_count = 0
    
    for idx, asset in enumerate(assets):
        asset_id = asset["id"]
        raw_name = asset["name"]
        dong = asset["dong"]
        parcel_main = asset["parcel_main"]
        parcel_sub = asset["parcel_sub"]
        existing_meta = asset.get("custom_metadata") or {}
        
        # Prepare Jibun
        jibun = str(parcel_main) if parcel_main else ""
        sub = str(parcel_sub).strip() if parcel_sub else ""
        if sub and sub not in ["0", "0000", "None"]:
            jibun += "-" + sub
            
        if not dong or not jibun:
            print(f"[{idx+1}/{len(assets)}] Skipping '{raw_name}': Missing dong or jibun info.")
            continue
            
        candidates = get_name_candidates(raw_name)
        print(f"\n[{idx+1}/{len(assets)}] Processing '{raw_name}' ({dong} {jibun})...")
        
        matched_url = None
        html_content = None
        
        # Try candidate URLs
        for cand in candidates:
            url_name = cand.replace(" ", "")
            url = f"https://officefind.co.kr/{dong}{jibun}{url_name}"
            try:
                # Add slight random delay to mimic human behavior
                time.sleep(random.uniform(1.5, 3.0))
                res = requests.get(url, headers=client_headers, timeout=5)
                if res.status_code == 200:
                    matched_url = url
                    html_content = res.text
                    break
            except Exception as e:
                pass
                
        if not matched_url or not html_content:
            print(f"  -> FAILED to match any URL on OfficeFind.")
            continue
            
        # Parse data
        area_py, hvac, subway = parse_officefind_details(html_content)
        
        if area_py is None:
            print(f"  -> Match found but failed to parse standard floor area.")
            continue
            
        print(f"  -> MATCHED: {matched_url}")
        print(f"  -> Parsed: Standard Floor Area={area_py} py, HVAC={hvac}, Subway={subway}")
        
        # Define field origins/sources mapping
        field_sources = {
            "name": "Original Excel",
            "gfa_py": "Original Excel",
            "efficiency_pct": "Original Excel" if asset.get("efficiency_pct") else None
        }
        
        vworld_fields = ["completion_date", "far_pct", "bcr_pct", "building_area_sqm", "land_area_sqm", "scale", "parking_info", "elevators_info"]
        for vf in vworld_fields:
            if asset.get(vf) is not None:
                field_sources[vf] = "V-World"
                
        field_sources["standard_floor_area_py"] = "OfficeFind"
        if hvac:
            field_sources["hvac_type"] = "OfficeFind"
        if subway:
            field_sources["subway_access"] = "OfficeFind"
            
        # Prepare custom_metadata payload
        updated_meta = {**existing_meta}
        if hvac:
            updated_meta["hvac_type"] = hvac
        if subway:
            updated_meta["subway_access"] = subway
            
        existing_sources = existing_meta.get("field_sources") or {}
        merged_sources = {**existing_sources, **field_sources}
        updated_meta["field_sources"] = {k: v for k, v in merged_sources.items() if v is not None}
        
        update_payload = {
            "standard_floor_area_py": area_py,
            "custom_metadata": updated_meta
        }
        
        patch_url = f"{supabase_url}/rest/v1/office_assets?id=eq.{asset_id}"
        patch_res = requests.patch(patch_url, headers=headers_base, data=json.dumps(update_payload))
        if patch_res.status_code in [200, 204]:
            print(f"  -> SUCCESS: Updated database with OfficeFind attributes & provenance sources.")
            success_count += 1
        else:
            print(f"  -> FAILED to update database: {patch_res.text}")
            
    print(f"\n🎉 Crawling batch finished. Successfully updated {success_count} assets.")

if __name__ == "__main__":
    main()
