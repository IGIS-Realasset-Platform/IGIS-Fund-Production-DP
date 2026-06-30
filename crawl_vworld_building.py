import requests
import json
import os
import re

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
vworld_key = env.get("VITE_VWORLD_API_KEY") # V-World API Key
vworld_domain = env.get("VITE_VWORLD_DOMAIN", "http://localhost") # Domain registered with V-World

if not supabase_url or not supabase_key:
    print("Error: Supabase config not found in .env files.")
    exit(1)

if not vworld_key:
    print("WARNING: VITE_VWORLD_API_KEY not found in .env. Please register a key at https://www.vworld.kr")
    print("Using a placeholder/mock key for draft check...")
    vworld_key = "MOCK_KEY"

headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json"
}

# Date format cleaner (e.g. YYYYMMDD to YYYY-MM-DD)
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
    # Try road address first, then parcel as fallback
    for addr_type in ["road", "parcel"]:
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
            r = requests.get(url, params=params, timeout=5)
            if r.status_code == 200:
                data = r.json()
                if data.get("response", {}).get("status") == "OK":
                    result = data["response"]["result"]
                    point = result.get("point", {})
                    lat = float(point.get("y")) if point.get("y") else None
                    lng = float(point.get("x")) if point.get("x") else None
                    
                    # Extract PNU from items list
                    items = result.get("items", [])
                    pnu = None
                    if items:
                        pnu = items[0].get("pnu")
                        
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
        r = requests.get(url, params=params, timeout=5)
        if r.status_code == 200:
            data = r.json()
            # V-World / NSDI REST API response usually contains a root wrapper like buildingUses or fields
            # Check response structure
            root = data.get("buildingUses", {}) or data.get("response", {})
            fields = root.get("field", [])
            if fields:
                # Return the first building record found
                return fields[0]
            # Fallback check if fields are listed directly under result
            result = data.get("result", {})
            if isinstance(result, list) and result:
                return result[0]
            elif isinstance(result, dict) and result.get("items"):
                return result["items"][0]
    except Exception as e:
        print(f"Error fetching building details for PNU {pnu}: {e}")
        
    return None

def main():
    if vworld_key == "MOCK_KEY":
        print("Please configure VITE_VWORLD_API_KEY in your .env or .env.local file to start crawling.")
        print("Abort crawling.")
        return

    # Fetch assets from Supabase where metadata fields are NULL
    # To avoid API rate limit blocks, we can fetch up to 100 assets per run
    url = f"{supabase_url}/rest/v1/office_assets?select=id,name,address,completion_date,far_pct&limit=1000"
    r = requests.get(url, headers=headers)
    if r.status_code != 200:
        print(f"Error loading assets from Supabase: {r.text}")
        return
        
    assets = r.json()
    print(f"Loaded {len(assets)} assets. Scanning for missing details...")
    
    updated_count = 0
    
    for asset in assets:
        asset_id = asset["id"]
        name = asset["name"]
        address = asset["address"]
        
        # Check if coordinates or completion info is missing
        print(f"\nProcessing '{name}' ({address})...")
        pnu, lat, lng = fetch_pnu_and_coords(address)
        
        update_payload = {}
        if lat and lng:
            update_payload["latitude"] = lat
            update_payload["longitude"] = lng
            print(f"  -> Coords mapped: Lat={lat}, Lng={lng}")
            
        if pnu:
            print(f"  -> PNU code mapped: {pnu}")
            details = fetch_building_details(pnu)
            if details:
                # Map fields checking both camelCase and snake_case from the API response
                land_area = details.get("platArea") or details.get("plat_area")
                main_use = details.get("mainPrposCdNm") or details.get("main_prpos_cd_nm") or details.get("mainPrposNm")
                completion = details.get("useAprvDe") or details.get("use_aprv_de") or details.get("useAprvDate")
                far = details.get("vlRat") or details.get("vl_rat")
                bcr = details.get("bcRat") or details.get("bc_rat")
                bld_area = details.get("archArea") or details.get("arch_area")
                
                # Floors & scale construction
                above = details.get("groFloorCo") or details.get("gro_floor_co") or details.get("grndFlrCnt")
                below = details.get("undgFloorCo") or details.get("undg_floor_co") or details.get("ugrdFlrCnt")
                
                # Parking & Elevators
                parking = details.get("parkingCo") or details.get("parking_co") or details.get("pkngCnt")
                elevators = details.get("elevatorCo") or details.get("elevator_co") or details.get("elvtrCnt")
                
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
                    
                if parking:
                    update_payload["parking_info"] = f"총 {parking}대" if str(parking).isdigit() else str(parking)
                if elevators:
                    update_payload["elevators_info"] = f"{elevators}대" if str(elevators).isdigit() else str(elevators)
                    
                print(f"  -> Building details fetched: Use={main_use}, Date={completion}, FAR={far}%")
                
        if update_payload:
            # Send patch to Supabase to update the asset info
            patch_url = f"{supabase_url}/rest/v1/office_assets?id=eq.{asset_id}"
            res = requests.patch(patch_url, headers=headers, data=json.dumps(update_payload))
            if res.status_code in [200, 204]:
                print(f"  -> SUCCESS: Updated metadata for '{name}' in Supabase DB.")
                updated_count += 1
            else:
                print(f"  -> FAILED to update database: {res.text}")
        else:
            print("  -> No new details found to update.")
            
    print(f"\n🎉 Scanning and Crawling Complete. Updated {updated_count} assets.")

if __name__ == "__main__":
    main()
