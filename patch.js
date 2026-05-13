const fs = require('fs');
let content = fs.readFileSync('src/components/system/shared/IotaTwo816DetailCard.jsx', 'utf8');

// Update phase dates and labels
content = content.replace("{ id: 'phase1', label: '최초UW', date: '2022.12' }", "{ id: 'phase1', label: '최초UW', date: '2023.01' }");
content = content.replace("{ id: 'phase2', label: '자산매입', date: '2024.03' }", "{ id: 'phase2', label: '정비계획 변경', date: '2023.11' }");
content = content.replace("{ id: 'phase3', label: '통합심의', date: '2024.12' }", "{ id: 'phase3', label: '자산매입', date: '2024.03' }");
content = content.replace("{ id: 'phase4', label: '기존 브릿지', date: '2025.06' }", "{ id: 'phase4', label: '브릿지론 재연장', date: '2025.10' }");
content = content.replace("{ id: 'phase5', label: '리파이낸싱', date: '2025.10' }", "{ id: 'phase5', label: '리파이낸싱', date: '2026.04' }");

// Also update Accordion headers
content = content.replace("Phase 1: PFV 설립 / 계약금 납입<br/><span className=\"text-[#86868B] font-normal\">(2023.01 / 4차 심의 기준)", "Phase 1: 최초UW<br/><span className=\"text-[#86868B] font-normal\">(2023.01 기준)");
content = content.replace("Phase 2: 정비계획 변경 / 연면적 상향<br/><span className=\"text-[#86868B] font-normal\">(2023.09~11 / 5차 심의 기준)", "Phase 2: 정비계획 변경 / 연면적 상향<br/><span className=\"text-[#86868B] font-normal\">(2023.11 기준)");
content = content.replace("Phase 3: 자산매입 완료 / 거래 연기<br/><span className=\"text-[#86868B] font-normal\">(2024.03 / KPMG 타당성 기준)", "Phase 3: 자산매입<br/><span className=\"text-[#86868B] font-normal\">(2024.03 기준)");
content = content.replace("Phase 4: 본 PF 지연 / 3차 BL 연장<br/><span className=\"text-[#86868B] font-normal\">(2025.10 / 리스크심의 기준)", "Phase 4: 브릿지론 재연장<br/><span className=\"text-[#86868B] font-normal\">(2025.10 기준)");
content = content.replace("Phase 5: EOD 발생, 긴급 수혈 / 리파이낸싱<br/><span className=\"text-[#86868B] font-normal\">(2026.01~04 / 최종안)", "Phase 5: 리파이낸싱<br/><span className=\"text-[#86868B] font-normal\">(2026.04 기준)");

fs.writeFileSync('src/components/system/shared/IotaTwo816DetailCard.jsx', content);
