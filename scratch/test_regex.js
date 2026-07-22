const rawText = `회의 상정 등급이 "즉시상정"에서 "회의점검"(으)로 변경되었습니다.
우선순위 점수가 "75점"에서 "55점"(으)로 변경되었습니다.
병목(Blocker)이 "활성화"에서 "비활성화"으로 변경되었습니다.`;

const parseSystemLogText = (rawText) => {
    if (!rawText) return [];
    const lines = rawText.split('\n').filter(Boolean);
    const parsedChanges = [];

    lines.forEach(line => {
        // Case 11: 회의 상정 등급
        if (line.includes('회의 상정 등급이') && line.includes('변경되었습니다')) {
            const match = line.match(/회의 상정 등급이\s*"([^"]+)"에서\s*"([^"]+)"\(으\)로/);
            if (match) {
                parsedChanges.push({
                    type: 'meeting_grade',
                    label: '상정등급',
                    oldVal: match[1],
                    newVal: match[2]
                });
                return;
            }
        }
        
        // Case 12: 우선순위 점수
        if (line.includes('우선순위 점수가')) {
            const match = line.match(/우선순위 점수가\s*"([^"]+)"에서\s*"([^"]+)"\(으\)로/);
            if (match) {
                parsedChanges.push({
                    type: 'priority_score',
                    label: '우선순위',
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
    });
    return parsedChanges;
};

console.log(parseSystemLogText(rawText));
