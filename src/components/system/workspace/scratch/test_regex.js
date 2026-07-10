const parseSystemLogText = (rawText) => {
    if (!rawText) return [];
    
    const lines = rawText.split('\n').filter(Boolean);
    const parsedChanges = [];

    lines.forEach(line => {
        // Case 1: 중요도 and 회의 상정 기준 (Combined)
        if (line.includes('중요도') && line.includes('회의 상정 기준')) {
            const impMatch = line.match(/중요도가\s*"([^"]+)"에서\s*"([^"]+)"으로/);
            const gradeMatch = line.match(/회의\s*상정\s*기준이\s*"([^"]+)"에서\s*"([^"]+)"으로/);
            if (impMatch) {
                parsedChanges.push({
                    type: 'importance_level',
                    label: '중요도',
                    oldVal: impMatch[1],
                    newVal: impMatch[2]
                });
            }
            if (gradeMatch) {
                parsedChanges.push({
                    type: 'meeting_grade',
                    label: '상정기준',
                    oldVal: gradeMatch[1],
                    newVal: gradeMatch[2]
                });
            }
            return;
        }

        // Case 2: 중요도 only
        if (line.includes('중요도가') && line.includes('변경되었습니다')) {
            const match = line.match(/중요도가\s*"([^"]+)"에서\s*"([^"]+)"으로/);
            if (match) {
                parsedChanges.push({
                    type: 'importance_level',
                    label: '중요도',
                    oldVal: match[1],
                    newVal: match[2]
                });
                return;
            }
        }

        // Case 3: 회의 상정 기준 only
        if (line.includes('회의 상정 기준') && line.includes('변경되었습니다')) {
            const match = line.match(/회의\s*상정\s*기준이\s*"([^"]+)"에서\s*"([^"]+)"으로/);
            if (match) {
                parsedChanges.push({
                    type: 'meeting_grade',
                    label: '상정기준',
                    oldVal: match[1],
                    newVal: match[2]
                });
                return;
            }
        }

        // Case 4: 상태 (Status)
        if (line.includes('상태가') && line.includes('변경되었습니다')) {
            const match = line.match(/상태가\s*"([^"]+)"에서\s*"([^"]+)"으로/);
            if (match) {
                parsedChanges.push({
                    type: 'status',
                    label: '상태',
                    oldVal: match[1],
                    newVal: match[2]
                });
                return;
            }
        }

        // Case 5: 병목 (Blocker)
        if (line.includes('병목(Blocker)이') && line.includes('변경되었습니다')) {
            const match = line.match(/병목\(Blocker\)이\s*"([^"]+)"에서\s*"([^"]+)"으로/);
            if (match) {
                parsedChanges.push({
                    type: 'is_blocker',
                    label: '병목',
                    oldVal: match[1],
                    newVal: match[2]
                });
                return;
            }
        }

        // Case 6: 담당자 (Assignee)
        if (line.includes('담당자가') && line.includes('변경되었습니다')) {
            const match = line.match(/담당자가\s*"([^"]+)"에서\s*"([^"]+)"으로/);
            if (match) {
                parsedChanges.push({
                    type: 'assignee',
                    label: '담당자',
                    oldVal: match[1],
                    newVal: match[2]
                });
                return;
            }
        }

        // Case 7: 외부상대방 (External Party)
        if (line.includes('외부상대방이') && line.includes('변경되었습니다')) {
            const match = line.match(/외부상대방이\s*"([^"]+)"에서\s*"([^"]+)"으로/);
            if (match) {
                parsedChanges.push({
                    type: 'external_party',
                    label: '외부상대방',
                    oldVal: match[1],
                    newVal: match[2]
                });
                return;
            }
        }

        // Case 8: 협조부서 (Coop Dept)
        if (line.includes('협조부서가') && line.includes('변경되었습니다')) {
            const match = line.match(/협조부서가\s*"([^"]+)"에서\s*"([^"]+)"으로/);
            if (match) {
                parsedChanges.push({
                    type: 'coop_depts',
                    label: '협조부서',
                    oldVal: match[1],
                    newVal: match[2]
                });
                return;
            }
        }

        // Case 9: 마감기한 (Due Date)
        if (line.includes('마감기한이') && line.includes('변경되었습니다')) {
            const match = line.match(/마감기한이\s*"([^"]+)"에서\s*"([^"]+)"으로/);
            if (match) {
                parsedChanges.push({
                    type: 'due_date',
                    label: '마감기한',
                    oldVal: match[1],
                    newVal: match[2]
                });
                return;
            }
        }

        // Case 10: 의사결정 필요 (Needs Decision)
        if (line.includes('의사결정 필요 여부가') && line.includes('변경되었습니다')) {
            const match = line.match(/의사결정\s*필요\s*여부가\s*"([^"]+)"에서\s*"([^"]+)"으로/);
            if (match) {
                parsedChanges.push({
                    type: 'needs_decision',
                    label: '결정필요',
                    oldVal: match[1],
                    newVal: match[2]
                });
                return;
            }
        }

        // Fallback
        parsedChanges.push({
            type: 'text',
            label: '이력',
            oldVal: null,
            newVal: line
        });
    });

    return parsedChanges;
};

// Test strings
const testCases = [
    '중요도가 "PF필수"에서 "중간"으로, 그에따라 회의 상정 기준이 "회의점검"에서 "주간관리"으로 변경되었습니다.',
    '상태가 "진행중"에서 "지연"으로 변경되었습니다.',
    '담당자가 "미정"에서 "전기영"으로 변경되었습니다.',
    '병목(Blocker)이 "비활성화"에서 "활성화"으로 변경되었습니다.',
    '협조부서가 "없음"에서 "개발솔루션; 자산관리"으로 변경되었습니다.',
    '의사결정 필요 여부가 "불필요"에서 "필요"으로 변경되었습니다.',
    '이것은 일반 텍스트 로그입니다.'
];

testCases.forEach((tc, idx) => {
    console.log(`\nTest Case ${idx + 1}: ${tc}`);
    console.log(JSON.stringify(parseSystemLogText(tc), null, 2));
});
