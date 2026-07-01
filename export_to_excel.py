# -*- coding: utf-8 -*-
import requests
import json
import os
import pandas as pd

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

headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json"
}

def fetch_table_data(table_name):
    print(f"Fetching data from '{table_name}'...")
    url = f"{supabase_url}/rest/v1/{table_name}?select=*&limit=5000"
    r = requests.get(url, headers=headers)
    if r.status_code == 200:
        return r.json()
    else:
        print(f"Error fetching {table_name}: {r.status_code} - {r.text}")
        return []

def main():
    # 1. Fetch data from Supabase
    assets_raw = fetch_table_data("office_assets")
    leasing_raw = fetch_table_data("office_quarterly_leasing")
    transactions_raw = fetch_table_data("office_transactions")
    tenant_leases_raw = fetch_table_data("office_tenant_leases")
    
    # 2. Process Office Assets & Provenance Sources
    processed_assets = []
    
    # Provenance tracked fields
    tracked_fields = [
        "latitude", "longitude", "completion_date", "far_pct", "bcr_pct",
        "building_area_sqm", "land_area_sqm", "scale",
        "standard_floor_area_py", "hvac_type", "subway_access",
        "floors_above", "floors_below", "main_use"
    ]
    
    for asset in assets_raw:
        item = {}
        # Get custom metadata
        meta = asset.get("custom_metadata") or {}
        sources = meta.get("field_sources") or {}
        
        # Pull standard columns
        for col in asset.keys():
            if col != "custom_metadata":
                item[col] = asset[col]
                
        # Inject HVAC, subway specs from custom_metadata
        item["hvac_type"] = meta.get("hvac_type")
        item["subway_access"] = meta.get("subway_access")
        item["main_structure"] = meta.get("main_structure")
        
        # Inject source columns for key data fields to guarantee provenance
        for f in tracked_fields:
            if f in item and item[f] is not None:
                source_val = sources.get(f)
                # Fallback to defaults if source is missing
                if not source_val:
                    if f in ["latitude", "longitude", "completion_date", "far_pct", "bcr_pct", "building_area_sqm", "land_area_sqm", "scale", "floors_above", "floors_below", "main_use"]:
                        source_val = "V-World"
                    elif f in ["standard_floor_area_py", "hvac_type", "subway_access"]:
                        source_val = "OfficeFind"
                    else:
                        source_val = "Original Excel"
                item[f"{f}_출처"] = source_val
            else:
                item[f"{f}_출처"] = ""
                
        processed_assets.append(item)
        
    df_assets = pd.DataFrame(processed_assets)
    df_leasing = pd.DataFrame(leasing_raw)
    df_transactions = pd.DataFrame(transactions_raw)
    df_leases = pd.DataFrame(tenant_leases_raw)
    
    # Rearrange asset columns to place sources next to their targets
    ordered_cols = []
    base_cols = [c for c in df_assets.columns if not c.endswith("_출처")]
    
    for c in base_cols:
        ordered_cols.append(c)
        src_col = f"{c}_출처"
        if src_col in df_assets.columns:
            ordered_cols.append(src_col)
            
    df_assets = df_assets[ordered_cols]
    
    # 3. Export to multi-sheet Excel
    output_path = "/Users/jkjeon2025/Documents/GitHub/IGIS Fund Production DP/office_10k_dataset.xlsx"
    
    print(f"Writing all datasets to Excel: {output_path}...")
    with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
        df_assets.to_excel(writer, sheet_name="1.오피스_자산_마스터", index=False)
        df_leasing.to_excel(writer, sheet_name="2.임대차_시계열", index=False)
        df_transactions.to_excel(writer, sheet_name="3.매매_거래_사례", index=False)
        df_leases.to_excel(writer, sheet_name="4.임차인_이전_이력", index=False)
        
    print("Excel export complete!")

if __name__ == "__main__":
    main()
