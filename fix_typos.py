import os
from supabase import create_client

url = None
key = None
if os.path.exists('.env.local'):
    with open('.env.local', 'r') as f:
        for line in f:
            if 'VITE_SUPABASE_URL=' in line:
                url = line.split('=')[1].strip()
            if 'VITE_SUPABASE_ANON_KEY=' in line:
                key = line.split('=')[1].strip()

supabase = create_client(url, key)

mapping = {
    '(주)게이트플래닝': '㈜게우트플래닝',
    '(주)디피니트파트너스': '㈜데피니트파트너스',
    '(주)디와이시스템': '㈜디와이시스템',
    '(주)에스제이더블유인터내셔널': '㈜에스제이더블유인터내셔널',
    '(주)케이티에스테이트': '㈜케이티에스테이트',
    '구봉산업(주)': '구봉산업㈜',
    '한중건설(주)': '한중건설㈜',
    '이지스자산운용(주)': '이지스자산운용㈜'
}

print("Starting to update institution names...")
for old_name, new_name in mapping.items():
    try:
        # Check if the old name exists
        res = supabase.table('iota_capital_stack').select('id').eq('institution_name', old_name).execute()
        if len(res.data) > 0:
            print(f"Updating '{old_name}' -> '{new_name}' ({len(res.data)} records)")
            supabase.table('iota_capital_stack').update({'institution_name': new_name}).eq('institution_name', old_name).execute()
        else:
            print(f"No records found for '{old_name}'.")
    except Exception as e:
        print(f"Error updating {old_name}: {e}")

print("Update complete!")
