import sys

# 1. Update IotaLeftNav.jsx
path_nav = 'src/components/system/IotaLeftNav.jsx'
with open(path_nav, 'r') as f:
    nav_content = f.read()

nav_content = nav_content.replace("label: '의사결정 로그',", "label: '전체 업무 현황',")

with open(path_nav, 'w') as f:
    f.write(nav_content)

# 2. Update DecisionLog.jsx
path_log = 'src/components/system/DecisionLog.jsx'
with open(path_log, 'r') as f:
    log_content = f.read()

log_content = log_content.replace(
    '<h1 className="text-[36px] font-bold text-white tracking-tight leading-none font-[\'Inter\'] mb-[8px]">의사결정 로그</h1>',
    '<h1 className="text-[36px] font-bold text-white tracking-tight leading-none font-[\'Inter\'] mb-[8px]">전체 업무 현황</h1>'
)

log_content = log_content.replace(
    '<p className="text-[16px] text-[#86868B] leading-[26px]">사업 진행 간의 주요 협의 및 의사결정 이력을 추적합니다.</p>',
    '<p className="text-[16px] text-[#86868B] leading-[26px]">통합 수행 체계에서 IOTA CFT의 전체 업무 현황을 공유·협업·리스크·의사결정 관점으로 모아 봅니다.</p>'
)

log_content = log_content.replace(
    'workspaceLabel="의사결정 로그"',
    'workspaceLabel="전체 업무 현황"\n                defaultExpanded={false}'
)

with open(path_log, 'w') as f:
    f.write(log_content)

print("DecisionLog and LeftNav updated.")
