import csv
import os

filepath = "/Users/jkjeon2025/Library/Mobile Documents/com~apple~CloudDocs/JK x IGIS/기획추진/IFPDP/IOTA Seoul/IFPDP_기획및구축_총괄내역서.csv"

new_rows = [
    ['[디자인/UX] 워크스페이스 공통 자산 네임택 뱃지 도입', '완료', '전기영', '2026/05/19', '보통', '기획/UX', 'Workspace*.jsx', '각 테스크 번호 우측에 관련 자산(IOTA 공통, 816 PFV 등)을 명확히 인지할 수 있는 네임택 UI 일괄 도입'],
    ['[디자인/UX] 컴포넌트 간 시각적 단차 정밀 교정 (1px 제어)', '완료', '전기영', '2026/05/19', '보통', '기획/UX', 'Workspace*.jsx', '테마 네임택, 자산 네임택, 날짜 표시 박스의 상하/좌우 패딩을 1px 단위로 조율하여 7개 부서 뷰어의 시각적 안정성 극대화'],
    ['[과제 관리] 과거 스냅샷 뷰어 통합 제어 로직 구현', '완료', '전기영', '2026/05/19', '높음', '기획/UX', 'WorkspaceArchive.jsx', '아카이브 페이지에서 다수의 월별 전체선택 버튼을 최상단 단일 버튼으로 통합하고, 전체 해제 시 화면 블랭크를 방지하는 최소 1개 유지 안전 로직 적용'],
    ['[시스템/아키텍처] 컴포넌트 최적화 및 불필요한 리팩토링 차단', '완료', '전기영', '2026/05/19', '최고', '기획/아키텍처', '전체 영역', '오픈 당일 안정성 최우선을 위해 복잡한 구조 변경(useWorkspaceTasks 등)을 차단하고, 개별 파일 단위의 안전한 마이크로 업데이트 프로세스 확립']
]

with open(filepath, 'a', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerows(new_rows)

print("Rows appended successfully.")
