# -*- coding: utf-8 -*-
import requests
import json
import os
import re
import time

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
vworld_key = env.get("VITE_VWORLD_API_KEY")
vworld_domain = env.get("VITE_VWORLD_DOMAIN", "https://iotaseoul.cloud/")

if not supabase_url or not supabase_key:
    print("Error: Supabase config not found in .env files.")
    exit(1)

headers_supabase = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json"
}

# Proper Referer/Origin headers matching the V-World registered URL
headers_vworld = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Referer": vworld_domain,
    "Origin": vworld_domain
}

def clean_date_str(date_val):
    if not date_val:
        return None
    date_str = str(date_val).strip().replace("-", "").replace("/", "")
    if len(date_str) == 8 and date_str.isdigit():
        return f"{date_str[0:4]}-{date_str[4:6]}-{date_str[6:8]}"
    return date_val

def fetch_pnu_and_coords(address):
    """
    Step 1: Geocode address to get Lat/Lng and 19-digit PNU Code using V-World Geocoder 2.0
    """
    if not address:
        return None, None, None
        
    url = "https://api.vworld.kr/req/address"
    # Try road first, then parcel (parcel returns PNU inside level4LC)
    for addr_type in ["parcel", "road"]:
        params = {
            "service": "address",
            "request": "getcoord",
            "version": "2.0",
            "crs": "epsg:4326",
            "address": address,
            "type": addr_type,
            "key": vworld_key
        }
        try:
            r = requests.get(url, params=params, headers=headers_vworld, timeout=5)
            if r.status_code == 200:
                data = r.json()
                if data.get("response", {}).get("status") == "OK":
                    result = data["response"]["result"]
                    point = result.get("point", {})
                    lat = float(point.get("y")) if point.get("y") else None
                    lng = float(point.get("x")) if point.get("x") else None
                    
                    # Extract PNU from level4LC if parcel search
                    refined = data["response"].get("refined", {})
                    level4LC = refined.get("structure", {}).get("level4LC")
                    pnu = None
                    if level4LC and len(level4LC) == 19 and level4LC.isdigit():
                        pnu = level4LC
                        
                    if pnu or (lat and lng):
                        return pnu, lat, lng
        except Exception as e:
            print(f"Error during Geocoding {address} ({addr_type}): {e}")
            
    return None, None, None

def fetch_building_details(pnu):
    """
    Step 2: Retrieve building attributes using PNU Code via V-World getBuildingUse API
    """
    if not pnu:
        return None
        
    url = "https://api.vworld.kr/ned/data/getBuildingUse"
    params = {
        "pnu": pnu,
        "format": "json",
        "key": vworld_key,
        "domain": vworld_domain
    }
    
    try:
        r = requests.get(url, params=params, headers=headers_vworld, timeout=5)
        if r.status_code == 200:
            data = r.json()
            root = data.get("buildingUses", {}) or data.get("response", {})
            fields = root.get("field", [])
            if fields:
                return fields[0]
            result = data.get("result", {})
            if isinstance(result, list) and result:
                return result[0]
            elif isinstance(result, dict) and result.get("items"):
                return result["items"][0]
    except Exception as e:
        print(f"Error fetching building details for PNU {pnu}: {e}")
        
    return None

def main():
    # Fetch assets from Supabase
    # We load columns so we can perform parcel address fallback if needed
    url = f"{supabase_url}/rest/v1/office_assets?select=id,name,address,district,dong,parcel_main,parcel_sub,custom_metadata,completion_date,far_pct&limit=1000"
    r = requests.get(url, headers=headers_supabase)
    if r.status_code != 200:
        print(f"Error loading assets from Supabase: {r.text}")
        return
        
    assets = r.json()
    print(f"Loaded {len(assets)} assets. Scanning for missing building details...")
    
    updated_count = 0
    
    for idx, asset in enumerate(assets):
        asset_id = asset["id"]
        name = asset["name"]
        address = asset["address"]
        district = asset["district"]
        dong = asset["dong"]
        parcel_main = asset["parcel_main"]
        parcel_sub = asset["parcel_sub"]
        existing_meta = asset.get("custom_metadata") or {}
        
        print(f"\n[{idx+1}/{len(assets)}] Processing '{name}'...")
        pnu, lat, lng = fetch_pnu_and_coords(address)
        
        # Fallback: construct parcel address if PNU is not resolved
        if not pnu and dong and parcel_main:
            district_str = district if district else ""
            parcel_addr = f"서울특별시 {district_str} {dong} {parcel_main}"
            sub = str(parcel_sub).strip()
            if sub and sub not in ["0", "0000", "None"]:
                parcel_addr += f"-{sub}"
            print(f"  -> PNU fallback parcel search: {parcel_addr}")
            pnu, _, _ = fetch_pnu_and_coords(parcel_addr)
            
        update_payload = {}
        if lat and lng:
            update_payload["latitude"] = lat
            update_payload["longitude"] = lng
            
        if pnu:
            print(f"  -> Extracted PNU: {pnu}")
            details = fetch_building_details(pnu)
            if details:
                # Map fields based on NSDI getBuildingUse actual response keys
                land_area = details.get("buldPlotAr")
                main_use = details.get("mainPrposCodeNm")
                completion = details.get("useConfmDe")
                far = details.get("measrmtRt")
                bcr = details.get("btlRt")
                bld_area = details.get("buldBildngAr")
                above = details.get("groundFloorCo")
                below = details.get("undgrndFloorCo")
                structure = details.get("strctCodeNm")
                
                # Assign payloads
                if land_area: update_payload["land_area_sqm"] = float(land_area)
                if main_use: update_payload["main_use"] = str(main_use)
                if completion: update_payload["completion_date"] = clean_date_str(completion)
                if far: update_payload["far_pct"] = float(far)
                if bcr: update_payload["bcr_pct"] = float(bcr)
                if bld_area: update_payload["building_area_sqm"] = float(bld_area)
                
                if above is not None or below is not None:
                    above_val = int(above) if above else 0
                    below_val = int(below) if below else 0
                    update_payload["floors_above"] = above_val
                    update_payload["floors_below"] = below_val
                    update_payload["scale"] = f"지하 {below_val}층 / 지상 {above_val}층"
                
                # Provenance field sources tagging
                field_sources = {
                    "latitude": "V-World" if lat else None,
                    "longitude": "V-World" if lng else None
                }
                
                for f in ["completion_date", "far_pct", "bcr_pct", "building_area_sqm", "land_area_sqm", "scale"]:
                    if update_payload.get(f) is not None:
                        field_sources[f] = "V-World"
                        
                updated_meta = {**existing_meta}
                if structure:
                    updated_meta["main_structure"] = structure
                    field_sources["main_structure"] = "V-World"
                    
                existing_sources = existing_meta.get("field_sources") or {}
                merged_sources = {**existing_sources, **field_sources}
                updated_meta["field_sources"] = {k: v for k, v in merged_sources.items() if v is not None}
                
                update_payload["custom_metadata"] = updated_meta
                print(f"  -> SUCCESS: Retrieved details. Use={main_use}, Date={completion}, FAR={far}%")
            else:
                print("  -> NSDI Building Use API returned no fields.")
        else:
            print("  -> Could not resolve PNU code.")
            
        if update_payload:
            patch_url = f"{supabase_url}/rest/v1/office_assets?id=eq.{asset_id}"
            res = requests.patch(patch_url, headers=headers_supabase, data=json.dumps(update_payload))
            if res.status_code in [200, 204]:
                updated_count += 1
            else:
                print(f"  -> Database update failed: {res.text}")
        else:
            print("  -> Nothing to update.")
            
        # Time sleep between requests to be gentle
        time.sleep(0.3)
            
    print(f"\n🎉 V-World Crawling Complete. Updated {updated_count} assets with structural details.")

if __name__ == "__main__":
    main()
