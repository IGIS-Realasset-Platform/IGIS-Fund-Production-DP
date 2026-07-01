# -*- coding: utf-8 -*-
import requests
import os
import json
from collections import defaultdict

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

headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json"
}

def main():
    # 1. Fetch all assets
    print("Fetching all assets from office_assets...")
    url = f"{supabase_url}/rest/v1/office_assets?select=*"
    r = requests.get(url, headers=headers)
    if r.status_code != 200:
        print(f"Error fetching assets: {r.text}")
        return
        
    assets = r.json()
    print(f"Loaded {len(assets)} raw asset records.")
    
    # 2. Group by building name
    grouped = defaultdict(list)
    for a in assets:
        grouped[a["name"]].append(a)
        
    duplicate_ids_to_remove = []
    
    # 3. Process each group to find the survivor
    for name, group in grouped.items():
        if len(group) <= 1:
            continue
            
        # Sort group by completeness
        # We prefer assets with:
        # 1) latitude is not null
        # 2) standard_floor_area_py is not null
        # 3) custom_metadata has more fields
        def completeness_score(x):
            score = 0
            if x.get("latitude") is not None:
                score += 1000
            if x.get("standard_floor_area_py") is not None:
                score += 500
            meta = x.get("custom_metadata") or {}
            score += len(meta.keys())
            return score
            
        sorted_group = sorted(group, key=completeness_score, reverse=True)
        survivor = sorted_group[0]
        survivor_id = survivor["id"]
        
        duplicates = sorted_group[1:]
        print(f"Building '{name}': Keeping ID {survivor_id} (score {completeness_score(survivor)}). Removing {len(duplicates)} duplicates.")
        
        for dup in duplicates:
            dup_id = dup["id"]
            duplicate_ids_to_remove.append(dup_id)
            
            # Redirect FKs in office_quarterly_leasing
            r1 = requests.patch(
                f"{supabase_url}/rest/v1/office_quarterly_leasing?office_id=eq.{dup_id}",
                headers=headers,
                data=json.dumps({"office_id": survivor_id})
            )
            
            # Redirect FKs in office_transactions
            r2 = requests.patch(
                f"{supabase_url}/rest/v1/office_transactions?office_id=eq.{dup_id}",
                headers=headers,
                data=json.dumps({"office_id": survivor_id})
            )
            
            # Redirect FKs in office_tenant_leases (from_office_id)
            r3 = requests.patch(
                f"{supabase_url}/rest/v1/office_tenant_leases?from_office_id=eq.{dup_id}",
                headers=headers,
                data=json.dumps({"from_office_id": survivor_id})
            )
            
            # Redirect FKs in office_tenant_leases (to_office_id)
            r4 = requests.patch(
                f"{supabase_url}/rest/v1/office_tenant_leases?to_office_id=eq.{dup_id}",
                headers=headers,
                data=json.dumps({"to_office_id": survivor_id})
            )
            
    # 4. Delete the duplicate assets
    if duplicate_ids_to_remove:
        print(f"Total duplicate assets to delete: {len(duplicate_ids_to_remove)}")
        # Delete in chunks of 50 to avoid URL length limits
        chunk_size = 50
        for i in range(0, len(duplicate_ids_to_remove), chunk_size):
            chunk = duplicate_ids_to_remove[i:i+chunk_size]
            id_list = ",".join(f"{cid}" for cid in chunk)
            delete_url = f"{supabase_url}/rest/v1/office_assets?id=in.({id_list})"
            r_del = requests.delete(delete_url, headers=headers)
            if r_del.status_code not in [200, 204]:
                print(f"Error deleting batch: {r_del.status_code} - {r_del.text}")
            else:
                print(f"Successfully deleted batch of {len(chunk)} duplicate assets.")
    else:
        print("No duplicate assets found to delete.")
        
    print("Database deduplication successfully finished!")

if __name__ == "__main__":
    main()
