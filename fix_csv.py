import csv
import os

filepath = "/Users/jkjeon2025/Library/Mobile Documents/com~apple~CloudDocs/JK x IGIS/기획추진/IFPDP/IOTA Seoul/IFPDP_기획및구축_총괄내역서.csv"

with open(filepath, 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    rows = list(reader)

# Modify header if needed, but it's just '작업 유형'
for i, row in enumerate(rows):
    if i == 0:
        continue
    if len(row) > 5:
        # column 5 is '작업 유형' (0-indexed)
        if row[5].startswith('기획/'):
            row[5] = row[5].replace('기획/', '기획 및 구축/')
        # column 7 is '코멘트' (0-indexed)
        # Ensure the wording says '구축', '개발', '구현 완료' instead of just '기획' at the end
        if row[7].endswith('기획'):
            row[7] = row[7][:-2] + '기획 및 구축 완료'
        elif row[7].endswith('설계'):
            row[7] = row[7][:-2] + '설계 및 프론트엔드 개발 완료'
        elif row[7].endswith('수립'):
            row[7] = row[7][:-2] + '수립 및 시스템 적용 완료'

with open(filepath, 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerows(rows)

print("CSV updated successfully.")
