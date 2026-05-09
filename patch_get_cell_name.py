import re

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # LogWriteBox.jsx pattern
    old_get_cell_box = """    const getCellName = (name) => {
        const cells = {
            '전기영': '기획추진', '이시정': '기획추진', '이관용': '기획추진',
            '이철승': 'CFT 총괄', '윤관식': 'CFT 총괄', '정조민': 'CFT 총괄', '우형석': 'CFT 총괄',
            '권순일': '사업PM', '강순용': '사업PM', '윤주형': '사업PM', '김제익': '사업PM', '류홍': '사업PM', '박만진': '사업PM', '박일훈': '사업PM', '이정원': '사업PM', '전무경': '사업PM', '한찬호': '사업PM', '박석제': '사업PM', '박채현': '사업PM', '소현준': '사업PM', '이수정': '사업PM', '조영비': '사업PM', '한수정': '사업PM',
            '박준호': '파이낸싱-LFC', '강석민': '파이낸싱-LFC', '정리훈': '파이낸싱-LFC', '손유정': '파이낸싱-LFC', '김지우': '파이낸싱-LFC', '박현승': '파이낸싱-LFC', '이성민A': '파이낸싱-LFC', '한승환': '파이낸싱-LFC',
            '홍장군': '개발관리', '채원': '개발관리', '김보성': '개발관리', '전승희': '개발관리', '김대익': '개발관리', '장성진': '개발관리', '이정훈': '개발관리', '박봉서': '개발관리',
            '김민지': '기업마케팅', '고아라': '기업마케팅',
            '김현수': '상품·디지털', '현철호': '상품·디지털', '신민호': '상품·디지털', '이가현': '상품·디지털', '정수명': '상품·디지털',
            '김행단': '펀드운용', '윤용택': 'IPR'
        };
        return cells[name] || '';
    };"""

    # WorkspaceActivityLog.jsx pattern
    old_get_cell_log = """    const getCellName = (name) => {
        const cells = {
            '전기영': '기획추진', '이시정': '기획추진', '이관용': '기획추진',
            '이철승': 'CFT 총괄', '윤관식': 'CFT 총괄', '정조민': 'CFT 총괄', '우형석': 'CFT 총괄',
            '권순일': '사업PM', '강순용': '사업PM', '윤주형': '사업PM', '김제익': '사업PM', '류홍': '사업PM', '박만진': '사업PM', '박일훈': '사업PM', '이정원': '사업PM', '전무경': '사업PM', '한찬호': '사업PM', '박석제': '사업PM', '박채현': '사업PM', '소현준': '사업PM', '이수정': '사업PM', '조영비': '사업PM', '한수정': '사업PM',
            '박준호': '파이낸싱-LFC', '강석민': '파이낸싱-LFC', '정리훈': '파이낸싱-LFC', '손유정': '파이낸싱-LFC', '김지우': '파이낸싱-LFC', '박현승': '파이낸싱-LFC', '이성민A': '파이낸싱-LFC', '한승환': '파이낸싱-LFC',
            '홍장군': '개발솔루션-DSC', '채원': '개발솔루션-DSC', '김보성': '개발솔루션-DSC', '전승희': '개발솔루션-DSC', '김대익': '개발솔루션-DSC', '장성진': '개발솔루션-DSC', '이정훈': '개발솔루션-DSC', '박봉서': '개발솔루션-DSC',
            '김민지': '기업마케팅-EMC', '고아라': '기업마케팅-EMC',
            '김현수': '상품·디지털-SSC', '현철호': '상품·디지털-SSC', '신민호': '상품·디지털-SSC', '이가현': '상품·디지털-SSC', '정수명': '상품·디지털-SSC',
            '김행단': '펀드운용-KAM', '윤용택': 'IPR'
        };
        return cells[name] || '기타';
    };"""

    new_get_cell_box = """    const getCellName = (name) => {
        if (!masterStakeholders || masterStakeholders.length === 0) return '';
        const stakeholder = masterStakeholders.find(s => s.contact_name === name);
        if (stakeholder && stakeholder.role_category && stakeholder.role_category !== 'IGIS 내부인력') {
            return stakeholder.role_category;
        }
        return '';
    };"""
    
    new_get_cell_log = """    const getCellName = (name) => {
        if (!masterStakeholders || masterStakeholders.length === 0) return '기타';
        const stakeholder = masterStakeholders.find(s => s.contact_name === name);
        if (stakeholder && stakeholder.role_category && stakeholder.role_category !== 'IGIS 내부인력') {
            return stakeholder.role_category;
        }
        return '기타';
    };"""

    if "LogWriteBox.jsx" in filepath:
        content = content.replace(old_get_cell_box, new_get_cell_box)
    else:
        content = content.replace(old_get_cell_log, new_get_cell_log)

    with open(filepath, 'w') as f:
        f.write(content)

replace_in_file('src/components/system/LogWriteBox.jsx')
replace_in_file('src/components/system/workspace/WorkspaceActivityLog.jsx')

print("Refactoring complete.")
