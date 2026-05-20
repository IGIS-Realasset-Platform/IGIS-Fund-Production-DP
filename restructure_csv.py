import csv
import re
import os

filepath = "/Users/jkjeon2025/Library/Mobile Documents/com~apple~CloudDocs/JK x IGIS/기획추진/IFPDP/IOTA Seoul/IFPDP_기획및구축_총괄내역서.csv"

with open(filepath, 'r', encoding='utf-8') as f:
    reader = list(csv.reader(f))

header = reader[0]
rows = reader[1:]

# Add new column '대분류' at index 1
new_header = [header[0], '대분류'] + header[1:]

type_map = {
    '기획 및 구축/IOTA Seoul': '통합 플랫폼 구축',
    '기획 및 구축/UX': 'UI/UX 설계 및 구현',
    '기획 및 구축/보안': '보안 아키텍처 설계',
    '기획 및 구축/DB': '데이터베이스 구축',
    '기획 및 구축/프론트엔드': '프론트엔드 최적화',
    '기획 및 구축/아키텍처': '시스템 아키텍처',
    '기획 및 구축/인프라': '인프라 연동 및 배포',
}

new_rows = []
for row in rows:
    if not row or not row[0]:
        continue
    
    task_name = row[0]
    
    match = re.match(r'^\[(.*?)\]\s*(.*)$', task_name)
    if match:
        category = match.group(1)
        new_task_name = match.group(2)
    else:
        category = '-'
        new_task_name = task_name
        
    task_type = row[5]
    
    # Map the old weird task type to a professional unified one
    new_task_type = type_map.get(task_type, task_type)
    # Fallback if there's an exact match issue
    if new_task_type == task_type:
        if 'IOTA Seoul' in task_type: new_task_type = '통합 플랫폼 구축'
        elif 'UX' in task_type: new_task_type = 'UI/UX 설계 및 구현'
        elif '보안' in task_type: new_task_type = '보안 아키텍처 설계'
        elif 'DB' in task_type: new_task_type = '데이터베이스 구축'
        elif '프론트엔드' in task_type: new_task_type = '프론트엔드 최적화'
        elif '아키텍처' in task_type: new_task_type = '시스템 아키텍처'
        elif '인프라' in task_type: new_task_type = '인프라 연동 및 배포'
        else: new_task_type = '통합 플랫폼 구축'

    
    new_row = [new_task_name, category] + row[1:5] + [new_task_type] + row[6:]
    new_rows.append(new_row)

with open(filepath, 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(new_header)
    writer.writerows(new_rows)

print("CSV restructured successfully.")
