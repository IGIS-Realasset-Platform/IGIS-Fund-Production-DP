export const MOBILE_WORKSPACES = [
    { code: 'WS_PM', label: '사업 PM', taskTable: 'iota_pm_tasks', orgNames: ['사업PM', '사업 PM'] },
    { code: 'WS_LFC', label: '파이낸싱-LFC', taskTable: 'iota_financing_tasks', orgNames: ['파이낸싱'] },
    { code: 'WS_DSC', label: '개발솔루션-DSC', taskTable: 'iota_development_tasks', orgNames: ['개발관리', '개발솔루션'] },
    { code: 'WS_EMC', label: '기업마케팅-EMC', taskTable: 'iota_marketing_tasks', orgNames: ['기업마케팅'] },
    { code: 'WS_SSC', label: '공간솔루션-SSC', taskTable: 'iota_digital_tasks', orgNames: ['상품·디지털', '공간솔루션'] },
    { code: 'WS_KAM', label: '펀드운용-KAM', taskTable: 'iota_fund_tasks', orgNames: ['펀드운용'] },
    { code: 'WS_IPR', label: 'IPR', taskTable: 'iota_ipr_tasks', orgNames: ['IPR'] }
];

export function getInitialWorkspace(memberInfo) {
    const defaultWorkspace = MOBILE_WORKSPACES.find(w => w.code === 'WS_SSC') || MOBILE_WORKSPACES[0];
    if (!memberInfo) return defaultWorkspace;
    
    // Check code first if memberInfo has workspace_code
    if (memberInfo.workspace_code) {
        const found = MOBILE_WORKSPACES.find(w => w.code === memberInfo.workspace_code);
        if (found) return found;
    }
    
    // Check org_name
    if (memberInfo.org_name) {
        const found = MOBILE_WORKSPACES.find(w => w.orgNames.includes(memberInfo.org_name));
        if (found) return found;
    }
    
    return defaultWorkspace;
}
