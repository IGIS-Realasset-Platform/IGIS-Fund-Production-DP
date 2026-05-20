import csv
import os

filepath = "/Users/jkjeon2025/Library/Mobile Documents/com~apple~CloudDocs/JK x IGIS/기획추진/IFPDP/IOTA Seoul/IFPDP_기획및구축_총괄내역서.csv"

new_rows = [
    ['[인프라/배포] iotaseoul.cloud 도메인 구매 및 실서버 배포 연동', '완료', '전기영', '2026/05/19', '최고', '기획/인프라', '도메인 연동', 'iotaseoul.cloud 공식 도메인을 확보하고 GitHub Pages 배포 환경(CNAME) 및 라우팅 시스템과 안정적으로 연결하여 실서버 런칭 완료'],
    ['[통합 보드] 비히클(Vehicle) 통합 구조 아키텍처 수립 및 전용 UX 기획', '완료', '전기영', '2026/05/19', '최고', '기획/UX', 'VehicleIntegrated.jsx', '다수의 펀드 및 PFV 자산들을 하나의 중앙 통제탑에서 관리할 수 있도록 비히클(Vehicle) 통합 구조의 상위 아키텍처를 설계하고 직관적인 요약 대시보드 UX 기획']
]

with open(filepath, 'a', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerows(new_rows)

print("Rows appended successfully.")
