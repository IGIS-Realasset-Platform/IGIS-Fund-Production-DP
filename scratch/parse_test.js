const parseSystemLogText = (rawText) => {
    if (!rawText) return [];
    const lines = rawText.split('\n').filter(Boolean);
    const parsedChanges = [];
    lines.forEach(line => {
        if (line.includes('회의 상정 등급이') && line.includes('변경되었습니다')) {
            const match = line.match(/회의 상정 등급이\s*"([^"]+)"에서\s*"([^"]+)"\(으\)로/);
            if (match) {
                parsedChanges.push({ type: 'meeting_grade', label: '상정등급', oldVal: match[1], newVal: match[2] });
                return;
            }
        }
        if (line.includes('병목(Blocker)이') && line.includes('변경되었습니다')) {
            const match = line.match(/병목\(Blocker\)이\s*"([^"]+)"에서\s*"([^"]+)"으로/);
            if (match) {
                parsedChanges.push({ type: 'is_blocker', label: '병목', oldVal: match[1], newVal: match[2] });
                return;
            }
        }
    });
    return parsedChanges;
};

const text = `회의 상정 등급이 "B_회의점검"에서 "A_즉시상정"(으)로 변경되었습니다.
병목(Blocker)이 "비활성화"에서 "활성화"으로 변경되었습니다.`;

console.log(parseSystemLogText(text));
