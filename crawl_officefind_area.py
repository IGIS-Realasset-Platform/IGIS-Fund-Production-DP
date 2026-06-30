# -*- coding: utf-8 -*-
import requests
import re
import os
import time
import json
import random
from bs4 import BeautifulSoup

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

def find_officefind_seo_url(name, dong=None, parcel_main=None):
    """
    Search building name or address via OfficeFind search API to fetch the exact seo_url suffix.
    """
    url = "https://officefind.co.kr/getOfficeData"
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest"
    }
    
    # 1. Clean variations
    variations = [name]
    
    # Remove outer parenthesis or bracket details
    clean_name = re.sub(r'\(.*?\)', '', name).strip()
    if clean_name and clean_name != name:
        variations.append(clean_name)
        
    clean_name_brackets = re.sub(r'<.*?>', '', clean_name).strip()
    if clean_name_brackets and clean_name_brackets not in variations:
        variations.append(clean_name_brackets)
        
    # Extract first parenthesis content (like POBA강남타워 from 더피나클강남 (POBA강남타워))
    m = re.search(r'\((.*?)\)', name)
    if m:
        p_content = m.group(1).strip()
        p_content = re.sub(r'^구,\s*', '', p_content).strip()
        if p_content and p_content not in variations:
            variations.append(p_content)
            
    # Try searching variations
    for query in variations:
        params = {
            "getType": "office",
            "page": 1,
            "search_str": query,
            "isSearchForm": 1
        }
        try:
            r = requests.get(url, params=params, headers=headers, timeout=5)
            if r.status_code == 200:
                data = r.json()
                items = data if isinstance(data, list) else data.get("data", [])
                if items:
                    for item in items:
                        addr = item.get("addr", "")
                        # Address filter check to avoid mismatches
                        if dong and dong not in addr:
                            continue
                        return item.get("seo_url"), item.get("subway"), item.get("M_NM")
        except Exception as e:
            pass
            
    # 2. Address fallback: dong + parcel_main
    if dong and parcel_main:
        query = f"{dong} {parcel_main}"
        params = {
            "getType": "office",
            "page": 1,
            "search_str": query,
            "isSearchForm": 1
        }
        try:
            r = requests.get(url, params=params, headers=headers, timeout=5)
            if r.status_code == 200:
                data = r.json()
                items = data if isinstance(data, list) else data.get("data", [])
                if items:
                    return items[0].get("seo_url"), items[0].get("subway"), items[0].get("M_NM")
        except Exception as e:
            pass
            
    return None, None, None

def parse_officefind_details(html):
    """
    Parse standard floor area, HVAC type, and subway access from OfficeFind HTML using BeautifulSoup
    """
    standard_floor_area_py = None
    hvac_type = None
    subway_access = None
    
    try:
        soup = BeautifulSoup(html, 'html.parser')
        for tr in soup.find_all("tr"):
            th = tr.find("th")
            td = tr.find("td")
            if th and td:
                th_text = th.text.strip()
                td_text = td.text.strip()
                if "기준층 면적" in th_text:
                    # Look for digits after "임대"
                    match = re.search(r'임대\s*([\d,.]+)', td_text)
                    if match:
                        try:
                            area_sqm = float(match.group(1).replace(",", ""))
                            # 1 sqm = 0.3025 py (or / 3.3058)
                            standard_floor_area_py = round(area_sqm / 3.3058, 2)
                        except ValueError:
                            pass
                elif "냉난방" in th_text:
                    hvac_type = td_text
                elif "지하철역" in th_text:
                    subway_access = td_text
    except Exception as e:
        print(f"Error parsing HTML: {e}")
        
    return standard_floor_area_py, hvac_type, subway_access

def main():
    # Fetch assets from Supabase where standard_floor_area_py is NULL
    url = f"{supabase_url}/rest/v1/office_assets?select=id,name,dong,parcel_main,parcel_sub,custom_metadata,completion_date,far_pct,efficiency_pct&standard_floor_area_py=is.null&limit=350"
    
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
            
        print(f"\n[{idx+1}/{len(assets)}] Processing '{raw_name}' ({dong} {jibun})...")
        
        # Resolve SEO URL via search API
        seo_url, subway_fallback, matched_nm = find_officefind_seo_url(raw_name, dong, parcel_main)
        
        if not seo_url:
            print(f"  -> FAILED: Could not resolve SEO URL on OfficeFind.")
            continue
            
        print(f"  -> Resolved SEO URL: {seo_url} (Matched Name: '{matched_nm}')")
        
        # Fetch detailed page
        detail_url = f"https://officefind.co.kr/{seo_url}"
        html_content = None
        try:
            # Throttling to bypass firewall
            time.sleep(random.uniform(1.2, 2.5))
            res = requests.get(detail_url, headers=client_headers, timeout=5)
            if res.status_code == 200:
                html_content = res.text
            else:
                print(f"  -> HTTP Error {res.status_code} fetching page.")
        except Exception as e:
            print(f"  -> Request exception: {e}")
            
        if not html_content:
            continue
            
        # Parse data
        area_py, hvac, subway = parse_officefind_details(html_content)
        
        # Fallback subway from search result if page parsing didn't return it
        if not subway and subway_fallback:
            subway = subway_fallback
            
        if area_py is None:
            print(f"  -> FAILED: Could not parse standard floor area from page.")
            continue
            
        print(f"  -> SUCCESS: Parsed Area={area_py} py, HVAC={hvac}, Subway={subway}")
        
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
            print(f"  -> Database update success.")
            success_count += 1
        else:
            print(f"  -> Database update failed: {patch_res.text}")
            
    print(f"\n🎉 Crawling batch finished. Successfully updated {success_count} assets.")

if __name__ == "__main__":
    main()
