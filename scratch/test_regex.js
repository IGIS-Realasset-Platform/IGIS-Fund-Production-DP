const line = '병목(Blocker)이 "비활성화"에서 "활성화"으로 변경되었습니다.';
const match = line.match(/병목\(Blocker\)이\s*"([^"]+)"에서\s*"([^"]+)"으로/);
console.log(match);
