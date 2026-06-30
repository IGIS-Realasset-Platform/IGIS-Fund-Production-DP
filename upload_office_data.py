import pandas as pd
import json
import os
import requests
import re

file_path = "/Users/jkjeon2025/Downloads/오피스 섹터 1만평+ DB 202607.xlsx"

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
    print("Error: Supabase URL or Key not found in .env files.")
    exit(1)

print(f"Supabase URL: {supabase_url}")

def clean_val(val):
    if pd.isna(val) or val == "-" or val == "—":
        return None
    if hasattr(val, 'strftime'):
        return val.strftime("%Y-%m-%d")
    if isinstance(val, str):
        val = val.strip()
        if not val:
            return None
    return val

def clean_num(val):
    val = clean_val(val)
    if val is None:
        return None
    try:
        if isinstance(val, str):
            val = val.replace(",", "")
        return float(val)
    except:
        return None

def clean_date(val):
    val = clean_val(val)
    if val is None:
        return None
    if isinstance(val, str):
        val = val.replace(".", "-").replace("/", "-")
        parts = val.split("-")
        if len(parts) == 3:
            y, m, d = parts[0], parts[1], parts[2]
            return f"{y.zfill(4)}-{m.zfill(2)}-{d.zfill(2)}"
        return val
    try:
        return val.strftime("%Y-%m-%d")
    except:
        return str(val)

def generate_address(city, dist, dong, p_main, p_sub):
    parts = []
    if clean_val(city): parts.append(str(city))
    if clean_val(dist): parts.append(str(dist))
    if clean_val(dong): parts.append(str(dong))
    
    main = clean_val(p_main)
    sub = clean_val(p_sub)
    
    if main is not None:
        main_str = str(int(float(main))) if isinstance(main, (int, float)) or (isinstance(main, str) and main.replace('.','',1).isdigit()) else str(main)
        if sub is not None:
            sub_str = str(int(float(sub))) if isinstance(sub, (int, float)) or (isinstance(sub, str) and sub.replace('.','',1).isdigit()) else str(sub)
            if sub_str != '0':
                parts.append(f"{main_str}-{sub_str}")
            else:
                parts.append(main_str)
        else:
            parts.append(main_str)
            
    return " ".join(parts)

# Normalize names for fuzzy mapping
def normalize_name(name):
    if not name:
        return ""
    name = str(name).strip().replace(" ", "").lower()
    # Remove common suffixes
    name = re.sub(r'(빌딩|타워|센터|오피스|지구|지식산업센터|development|stabilized)$', '', name)
    # Remove text in parenthesis
    name = re.sub(r'\(.*?\)', '', name)
    name = re.sub(r'\[.*?\]', '', name)
    return name.strip()

ALL_ASSET_KEYS = [
    "name", "status", "submarket", "city", "district", "dong",
    "parcel_main", "parcel_sub", "address", "latitude", "longitude",
    "gfa_sqm", "gfa_py", "office_area_sqm", "office_area_py",
    "standard_floor_area_py", "land_area_sqm", "main_use",
    "completion_date", "remodeling_date", "scale", "far_pct",
    "building_area_sqm", "bcr_pct", "parking_info", "elevators_info",
    "efficiency_pct", "is_rent_or_headquarter", "is_aegis_asset",
    "expected_completion_year", "expected_completion_quarter",
    "construction_type", "floors_below", "floors_above",
    "actual_construction_start_date", "permit_date", "rental_type",
    "owner_developer", "trustee", "builder", "progress_status"
]

def make_full_asset(partial_dict):
    full_dict = {key: None for key in ALL_ASSET_KEYS}
    full_dict["is_aegis_asset"] = False
    full_dict["custom_metadata"] = {}
    full_dict.update(partial_dict)
    return full_dict

try:
    xl = pd.ExcelFile(file_path)
    
    # ==========================================
    # 1. Parse stabilized & pipeline assets
    # ==========================================
    df_st = xl.parse("기성오피스 1만평+", header=None)
    assets_to_insert = []
    leasing_to_insert = []
    
    for idx, row in df_st.iloc[3:].iterrows():
        name = clean_val(row[2])
        if not name: continue
        
        city = clean_val(row[4])
        dist = clean_val(row[5])
        dong = clean_val(row[6])
        p_main = clean_val(row[7])
        p_sub = clean_val(row[8])
        addr = generate_address(city, dist, dong, p_main, p_sub)
        
        asset = {
            "name": name,
            "status": "stabilized",
            "is_rent_or_headquarter": clean_val(row[1]),
            "submarket": clean_val(row[3]),
            "city": city,
            "district": dist,
            "dong": dong,
            "parcel_main": str(p_main) if p_main is not None else None,
            "parcel_sub": str(p_sub) if p_sub is not None else None,
            "address": addr,
            "gfa_sqm": clean_num(row[9]),
            "gfa_py": clean_num(row[10]),
            "office_area_sqm": clean_num(row[11]),
            "office_area_py": clean_num(row[12]),
            "standard_floor_area_py": clean_num(row[13]),
            "land_area_sqm": clean_num(row[14]),
            "main_use": clean_val(row[15]),
            "completion_date": clean_date(row[16]),
            "remodeling_date": clean_date(row[17]),
            "scale": clean_val(row[18]),
            "far_pct": clean_num(row[19]),
            "building_area_sqm": clean_num(row[20]),
            "bcr_pct": clean_num(row[21]),
            "parking_info": str(clean_val(row[22])) if clean_val(row[22]) else None,
            "elevators_info": str(clean_val(row[23])) if clean_val(row[23]) else None,
            "efficiency_pct": clean_num(row[24]) * 100 if clean_num(row[24]) and clean_num(row[24]) <= 1 else clean_num(row[24])
        }
        assets_to_insert.append(make_full_asset(asset))
        
        quarters = [("2025-1Q", 25), ("2025-2Q", 31), ("2025-3Q", 37), ("2025-4Q", 43)]
        for q_label, start_col in quarters:
            dep = clean_num(row[start_col])
            rent = clean_num(row[start_col+1])
            maint = clean_num(row[start_col+2])
            rf = clean_num(row[start_col+3])
            vac = clean_num(row[start_col+4])
            noc = clean_num(row[start_col+5])
            
            if any(val is not None for val in [dep, rent, maint, rf, vac, noc]):
                leasing_to_insert.append({
                    "building_name": name,
                    "address": addr,
                    "quarter": q_label,
                    "deposit_per_py": dep,
                    "monthly_rent_per_py": rent,
                    "maintenance_fee_per_py": maint,
                    "rent_free_months": rf,
                    "vacancy_rate": vac,
                    "noc": noc
                })

    df_new = xl.parse("신규 공급 예정 1만평+", header=None)
    for idx, row in df_new.iloc[2:].iterrows():
        name = clean_val(row[3])
        if not name: continue
        
        city = clean_val(row[5])
        dist = clean_val(row[6])
        dong = clean_val(row[7])
        p_main = clean_val(row[8])
        p_sub = clean_val(row[9])
        addr = generate_address(city, dist, dong, p_main, p_sub)
        
        asset = {
            "name": name,
            "status": "pipeline",
            "expected_completion_year": int(clean_num(row[1])) if clean_num(row[1]) else None,
            "expected_completion_quarter": clean_val(row[2]),
            "submarket": clean_val(row[4]),
            "city": city,
            "district": dist,
            "dong": dong,
            "parcel_main": str(p_main) if p_main is not None else None,
            "parcel_sub": str(p_sub) if p_sub is not None else None,
            "address": addr,
            "construction_type": clean_val(row[10]),
            "land_area_sqm": clean_num(row[11]),
            "building_area_sqm": clean_num(row[12]),
            "gfa_sqm": clean_num(row[13]),
            "gfa_py": clean_num(row[14]),
            "floors_below": int(clean_num(row[15])) if clean_num(row[15]) else None,
            "floors_above": int(clean_num(row[16])) if clean_num(row[16]) else None,
            "main_use": clean_val(row[17]),
            "actual_construction_start_date": clean_date(row[18]),
            "permit_date": clean_date(row[19]),
            "rental_type": clean_val(row[20]),
            "owner_developer": clean_val(row[21]),
            "trustee": clean_val(row[22]),
            "builder": clean_val(row[23]),
            "progress_status": clean_val(row[24])
        }
        assets_to_insert.append(make_full_asset(asset))

    print(f"Total Unique Assets to upload: {len(assets_to_insert)}")
    
    # Supabase Headers
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    # Clear existing data in correct sequence to prevent FK errors
    print("Clearing existing tables...")
    requests.delete(f"{supabase_url}/rest/v1/office_tenant_leases?select=*", headers=headers)
    requests.delete(f"{supabase_url}/rest/v1/office_transactions?select=*", headers=headers)
    requests.delete(f"{supabase_url}/rest/v1/office_quarterly_leasing?select=*", headers=headers)
    requests.delete(f"{supabase_url}/rest/v1/office_assets?select=*", headers=headers)

    # 1. Upload office_assets
    print("Uploading office_assets...")
    batch_size = 50
    inserted_assets = []
    for i in range(0, len(assets_to_insert), batch_size):
        batch = assets_to_insert[i:i+batch_size]
        res = requests.post(f"{supabase_url}/rest/v1/office_assets", headers=headers, data=json.dumps(batch))
        if res.status_code not in [200, 201]:
            print(f"Error inserting assets batch: {res.text}")
            exit(1)
        inserted_assets.extend(res.json())
        
    print(f"Successfully uploaded {len(inserted_assets)} office assets.")

    # Create mapping maps for fast lookup
    # 1) Exact address match, 2) Exact name match, 3) Normalized name match
    addr_map = {}
    name_map = {}
    norm_name_map = {}
    
    for a in inserted_assets:
        uuid_id = a["id"]
        name = a["name"]
        addr = a["address"]
        
        if addr: addr_map[addr] = uuid_id
        if name: name_map[name] = uuid_id
        
        norm = normalize_name(name)
        if norm: norm_name_map[norm] = uuid_id

    # Lookup helper using 3-step hybrid matching
    def find_office_id(name, addr):
        if addr and addr in addr_map:
            return addr_map[addr]
        if name and name in name_map:
            return name_map[name]
        norm = normalize_name(name)
        if norm and norm in norm_name_map:
            return norm_name_map[norm]
        return None

    # 2. Upload quarterly leasing
    leasing_payload = []
    for row in leasing_to_insert:
        office_id = find_office_id(row["building_name"], row["address"])
        if office_id:
            leasing_payload.append({
                "office_id": office_id,
                "quarter": row["quarter"],
                "deposit_per_py": row["deposit_per_py"],
                "monthly_rent_per_py": row["monthly_rent_per_py"],
                "maintenance_fee_per_py": row["maintenance_fee_per_py"],
                "rent_free_months": row["rent_free_months"],
                "vacancy_rate": row["vacancy_rate"],
                "noc": row["noc"]
            })
            
    print(f"Uploading {len(leasing_payload)} quarterly leasing records...")
    for i in range(0, len(leasing_payload), batch_size):
        batch = leasing_payload[i:i+batch_size]
        res = requests.post(f"{supabase_url}/rest/v1/office_quarterly_leasing", headers=headers, data=json.dumps(batch))
        if res.status_code not in [200, 201]:
            print(f"Error inserting leasing batch: {res.text}")
            exit(1)
    print("Leasing records uploaded successfully.")

    # 3. Parse and upload office_transactions
    df_tx = xl.parse("매매사례 1만평+", header=None)
    tx_payload = []
    tx_unmatched = []
    
    for idx, row in df_tx.iloc[2:].iterrows():
        name = clean_val(row[2])
        if not name: continue
        
        city = clean_val(row[4])
        dist = clean_val(row[5])
        dong = clean_val(row[6])
        p_main = clean_val(row[7])
        p_sub = clean_val(row[8])
        p_add = clean_val(row[9])
        addr = generate_address(city, dist, dong, p_main, p_sub)
        
        office_id = find_office_id(name, addr)
        if not office_id:
            tx_unmatched.append({"name": name, "address": addr})
            
        price_raw = clean_num(row[23])
        price_krw = price_raw * 1000 if price_raw is not None else None
        price_py_raw = clean_num(row[24])
        price_py_krw = price_py_raw * 1000 if price_py_raw is not None else None
        net_price_raw = clean_num(row[41])
        net_price_krw = net_price_raw * 1000 if net_price_raw is not None else None
        dep_raw = clean_num(row[42])
        dep_krw = dep_raw * 1000 if dep_raw is not None else None
        rent_raw = clean_num(row[43])
        rent_krw = rent_raw * 1000 if rent_raw is not None else None
        maint_raw = clean_num(row[44])
        maint_krw = maint_raw * 1000 if maint_raw is not None else None
        
        tx_payload.append({
            "office_id": office_id,
            "building_name": name,
            "transaction_year": int(clean_num(row[1])) if clean_num(row[1]) else None,
            "submarket": clean_val(row[3]),
            "city": city,
            "district": dist,
            "dong": dong,
            "parcel_main": str(p_main) if p_main is not None else None,
            "parcel_sub": str(p_sub) if p_sub is not None else None,
            "parcel_additional": p_add,
            "gfa_sqm": clean_num(row[10]),
            "gfa_py": clean_num(row[11]),
            "land_area_sqm": clean_num(row[12]),
            "land_area_py": clean_num(row[13]),
            "transaction_area_sqm": clean_num(row[14]),
            "transaction_area_py": clean_num(row[15]),
            "transaction_land_area_sqm": clean_num(row[16]),
            "transaction_land_area_py": clean_num(row[17]),
            "floors_above": int(clean_num(row[18])) if clean_num(row[18]) else None,
            "floors_below": int(clean_num(row[19])) if clean_num(row[19]) else None,
            "year_built": int(clean_num(row[20])) if clean_num(row[20]) else None,
            "is_new_or_remodeled": clean_val(row[21]),
            "remodeling_year": int(clean_num(row[22])) if clean_num(row[22]) else None,
            "transaction_price_krw": price_krw,
            "price_per_py_krw": price_py_krw,
            "seller_name": clean_val(row[25]),
            "seller_type": clean_val(row[26]),
            "seller_location": clean_val(row[27]),
            "buyer_name": clean_val(row[28]),
            "buyer_type": clean_val(row[29]),
            "buyer_location": clean_val(row[30]),
            "buyer_details": clean_val(row[31]),
            "buyer_purpose": clean_val(row[32]),
            "investment_vehicle": clean_val(row[33]),
            "investment_vehicle_detail": clean_val(row[34]),
            "acquisition_type": clean_val(row[35]),
            "transaction_type": clean_val(row[36]),
            "transaction_notes": clean_val(row[37]),
            "loan_interest_rate": clean_num(row[38]),
            "has_im_file": True if clean_val(row[39]) == "Y" else False,
            "leased_area_py": clean_num(row[40]),
            "net_acquisition_price_krw": net_price_krw,
            "deposit_per_py": dep_krw,
            "monthly_rent_per_py": rent_krw,
            "maintenance_fee_per_py": maint_krw,
            "efficiency_pct": clean_num(row[45]),
            "rent_free_months_1": clean_num(row[46]),
            "rent_free_months_2": clean_num(row[47]),
            "building_vacancy_rate": clean_num(row[48]),
            "submarket_vacancy_rate": clean_num(row[49]),
            "treasury_bond_5y_rate": clean_num(row[50]),
            "cap_rate_stabilized_nominal": clean_num(row[51]),
            "cap_rate_stabilized_real": clean_num(row[52]),
            "cap_rate_asis_nominal": clean_num(row[53]),
            "cap_rate_asis_real": clean_num(row[54]),
            "cap_rate_notes": clean_val(row[55])
        })
        
    print(f"Uploading {len(tx_payload)} transactions... (Unmatched to master assets: {len(tx_unmatched)})")
    for i in range(0, len(tx_payload), batch_size):
        batch = tx_payload[i:i+batch_size]
        res = requests.post(f"{supabase_url}/rest/v1/office_transactions", headers=headers, data=json.dumps(batch))
        if res.status_code not in [200, 201]:
            print(f"Error inserting transactions batch: {res.text}")
            exit(1)
            
    # 4. Parse and upload office_tenant_leases
    df_tenant = xl.parse("기업 임대차 사례 1만평+", header=None)
    tenant_payload = []
    tenant_unmatched = []
    
    for idx, row in df_tenant.iloc[3:].iterrows():
        tenant_name = clean_val(row[3])
        if not tenant_name: continue
        
        from_name = clean_val(row[8])
        from_addr = clean_val(row[7])
        to_name = clean_val(row[15])
        to_addr = clean_val(row[14])
        
        from_id = find_office_id(from_name, from_addr)
        to_id = find_office_id(to_name, to_addr)
        
        if not from_id and from_name: tenant_unmatched.append(from_name)
        if not to_id and to_name: tenant_unmatched.append(to_name)
        
        tenant_payload.append({
            "lease_type": clean_val(row[1]),
            "quarter": clean_date(row[2]),
            "tenant_name": tenant_name,
            
            # From
            "from_office_id": from_id,
            "from_office_name": from_name,
            "from_submarket": clean_val(row[4]),
            "from_city": "서울" if clean_val(row[4]) in ["CBD", "GBD", "YBD"] else None,
            "from_district": clean_val(row[5]),
            "from_dong": clean_val(row[6]),
            "from_address": from_addr,
            "from_gfa_py": clean_num(row[9]),
            "from_leased_area_sqm": clean_num(row[10]),
            
            # To
            "to_office_id": to_id,
            "to_office_name": to_name,
            "to_submarket": clean_val(row[11]),
            "to_city": "서울" if clean_val(row[11]) in ["CBD", "GBD", "YBD"] else None,
            "to_district": clean_val(row[12]),
            "to_dong": clean_val(row[13]),
            "to_address": to_addr,
            "to_gfa_py": clean_num(row[16]),
            "to_leased_area_sqm": clean_num(row[17]),
            
            "notes": clean_val(row[18]),
            "industry_sub": clean_val(row[19]),
            "industry_main": clean_val(row[20])
        })
        
    print(f"Uploading {len(tenant_payload)} tenant lease records... (Unmatched asset links: {len(set(tenant_unmatched))})")
    for i in range(0, len(tenant_payload), batch_size):
        batch = tenant_payload[i:i+batch_size]
        res = requests.post(f"{supabase_url}/rest/v1/office_tenant_leases", headers=headers, data=json.dumps(batch))
        if res.status_code not in [200, 201]:
            print(f"Error inserting tenant leases batch: {res.text}")
            exit(1)
            
    print("\n🎉 ALL OFFICE DB DATA POPULATED SUCCESSFULLY!")
    
    # Save unmatched mapping checklist as a report
    unmatched_report = {
        "transactions_unmatched_count": len(tx_unmatched),
        "transactions_unmatched": list({x["name"]: x for x in tx_unmatched}.values()),
        "tenant_unmatched_count": len(set(tenant_unmatched)),
        "tenant_unmatched": sorted(list(set(tenant_unmatched)))
    }
    with open("/Users/jkjeon2025/.gemini/antigravity-ide/brain/1da98514-6655-41df-a3d9-08a3ab0d358e/unmatched_assets_report.json", "w", encoding="utf-8") as out:
        json.dump(unmatched_report, out, ensure_ascii=False, indent=2)
    print("Saved unmatched mapping checklist to unmatched_assets_report.json")
    
except Exception as e:
    import traceback
    print("Error during migration:", e)
    traceback.print_exc()
