const fs = require('fs');
const path = require('path');

const dir = '/Users/jkjeon2025/Documents/GitHub/IGIS Fund Production DP/src/components/system/workspace';

const files = [
    {
        name: 'WorkspaceFinancing.jsx',
        title: '파이낸싱',
        desc: 'IOTA Seoul Capital Stack 및 대주단 파이프라인 관리',
        teams: [
            { label: 'LFC', leaderName: '박준호', leaderTitle: 'LFC 센터장', members: ['강석민', '정리훈', '손유정', '김지우', '박현승', '이성민A', '한승환'] }
        ]
    },
    {
        name: 'WorkspaceDevelopment.jsx',
        title: '개발관리',
        desc: '설계·시공·CM·감리 통제, 인허가/명도 대응, 공정·품질·안전 KPI',
        teams: [
            { label: '개발솔루션', leaderName: '홍장군', leaderTitle: '센터장', members: ['채원', '김보성', '전승희', '김대익', '장성진', '이정훈', '박봉서'] }
        ]
    },
    {
        name: 'WorkspaceMarketing.jsx',
        title: '기업마케팅',
        desc: '기업마케팅센터 (CMC) 업무 프로그레스 및 기업마케팅 DB',
        teams: [
            { label: '기업마케팅', leaderName: '김민지', leaderTitle: '기업마케팅담당', members: ['고아라', '권순일'] }
        ]
    },
    {
        name: 'WorkspaceDigital.jsx',
        title: '상품·디지털',
        desc: '상품 차별화 전략·POC, 테넌트 경험 설계, 디지털 인프라(보안·통신·DC)',
        teams: [
            { label: '공간솔루션', leaderName: '김현수', leaderTitle: '센터장', members: ['이가현', '정수명'] },
            { label: '디지털사업', leaderName: '현철호', leaderTitle: '그룹장', members: ['신민호'] }
        ]
    },
    {
        name: 'WorkspaceFund.jsx',
        title: '펀드운용',
        desc: '펀드(421) 운용 및 투자자 소통채널',
        teams: [
            { label: 'KAM', leaderName: '김행단', leaderTitle: '그룹장', members: [] }
        ]
    },
    {
        name: 'WorkspaceIpr.jsx',
        title: 'IPR',
        desc: '자본시장 소통 및 프로젝트 리츠 TFT 운영',
        teams: [
            { label: '투자', leaderName: '권순일', leaderTitle: '사업1파트장', members: [] },
            { label: '관리', leaderName: '윤용택', leaderTitle: '사업3파트', members: [] }
        ]
    }
];

function buildHeader(title, desc, teams) {
    let teamsHtml = teams.map((t, idx) => `
                    ${idx > 0 ? '<div className="w-full h-px bg-[#333]"></div>' : ''}
                    <div className="flex items-center pl-[20px] pr-[10px] py-[10px]">
                        <div className="w-[80px] shrink-0">
                            <span className="text-[13px] font-bold text-[#86868B]">${t.label}</span>
                        </div>
                        <div className="flex items-center gap-[12px] w-[130px] shrink-0">
                            <div className="relative w-[30px] h-[30px] shrink-0 rounded-full bg-[#3c3c3c] flex items-center justify-center overflow-hidden ml-[2px]">
                                <img src={\`\${import.meta.env.BASE_URL}${t.leaderName}.webp\`} alt="${t.leaderName}" className="w-full h-full object-cover" onError={(e) => { e.target.src = \`\${import.meta.env.BASE_URL}default_avatar.svg\`; }} />
                                <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none"></div>
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-white font-bold text-[13px] leading-tight">${t.leaderName}</span>
                                <span className="text-[#A1A1AA] text-[12px] mt-[1px] leading-tight">${t.leaderTitle}</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-x-1.5 gap-y-2 -ml-[6px]">
                            {${JSON.stringify(t.members)}.map(name => (
                                <div key={name} className="flex items-center gap-[6px] bg-[#222] border border-[#333] rounded-full pl-[4px] pr-[10px] py-[4px] min-w-[76px]">
                                    <div className="w-[21px] h-[21px] shrink-0 rounded-full bg-[#3c3c3c] overflow-hidden">
                                        <img src={\`\${import.meta.env.BASE_URL}\${name}.webp\`} alt={name} className="w-full h-full object-cover" onError={(e) => { e.target.src = \`\${import.meta.env.BASE_URL}default_avatar.svg\`; }} />
                                    </div>
                                    <span className="text-[#E5E5E5] text-[12px] font-medium leading-none">{name}</span>
                                </div>
                            ))}
                        </div>
                    </div>`).join('');

    return `        <div className="w-full flex-1 flex flex-col pt-[50px] pb-[60px] max-w-[1200px] mx-auto">
            {/* Header & Team Structure */}
            <div className="w-full flex justify-between items-center mb-[40px] gap-[40px]">
                {/* Header Metadata */}
                <div className="shrink-0 max-w-[300px]">
                    <h1 className="text-[36px] font-bold text-white tracking-tight leading-none font-['Inter'] mb-[12px]">${title}</h1>
                    <p className="text-[15px] text-[#86868B] leading-[24px]">${desc}</p>
                </div>
                
                {/* Team Structure */}
                <div className="border border-[#333] rounded-[24px] flex flex-col bg-transparent shrink-0">
${teamsHtml}
                </div>
            </div>`;
}

files.forEach(f => {
    const filePath = path.join(dir, f.name);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find where to replace
    // Start at: `<div className="w-full flex-1 flex flex-col ` or `<div className="w-full flex flex-col `
    // End at the matching </div> for the `w-full flex justify-between items-end mb-[24px]` div
    
    const startMatch = content.match(/<div className="w-full (flex-1 )?flex flex-col pt-\[\d+px\] pb-\[\d+px\] max-w-\[1200px\] mx-auto">/);
    if(!startMatch) {
        console.log("Could not find start in", f.name);
        return;
    }
    const startIndex = startMatch.index;
    
    // The end of the block we want to replace is the closing </div> of `mb-[24px]` block.
    // Wait, let's just find `mb-[24px]` and match its closing div.
    const headerMetadataMatch = content.indexOf('<div className="w-full flex justify-between items-end mb-[24px]">');
    if (headerMetadataMatch === -1) {
        console.log("Could not find header metadata block in", f.name);
        return;
    }
    
    // Find the next </div> that corresponds to the end of `mb-[24px]`
    // Usually it's followed by a blank line and then `{/* ...` or `<div ...`
    // Let's use a simple heuristic: Find the next occurrence of `</div>\n            </div>`
    // Actually, in `WorkspaceFinancing.jsx`, `WorkspaceDevelopment.jsx`, etc., the `mb-[24px]` block closes right before the next section like `{/* 421 Fund Equity Stack */}` or `{/* 1. 주간 플래닝 칸반 */}`.
    
    let endIndex = content.indexOf('</div>\n            </div>', headerMetadataMatch);
    if(endIndex !== -1) {
        endIndex += '</div>\n            </div>'.length;
    } else {
        console.log("Could not find end index in", f.name);
        return;
    }

    const newHeader = buildHeader(f.title, f.desc, f.teams);
    
    const newContent = content.substring(0, startIndex) + newHeader + content.substring(endIndex);
    fs.writeFileSync(filePath, newContent);
    console.log("Patched", f.name);
});
