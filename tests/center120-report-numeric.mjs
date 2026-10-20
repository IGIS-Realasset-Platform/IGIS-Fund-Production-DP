import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const css=await fs.readFile('src/report.css','utf8');
const rules=[...css.matchAll(/\.official-form-table\s+\.form-atomic\s*\{([^}]+)\}/g)];
assert.equal(rules.length,1,'출력 숫자 규칙은 하나의 정의를 사용합니다.');
assert.match(rules[0][1],/font-variant-numeric\s*:\s*normal\s*(?:;|$)/,'PDF 숫자는 tnum의 PUA 대체글리프가 아닌 복사·검색 가능한 숫자를 사용합니다.');
assert.doesNotMatch(css,/\.form-atomic[^}]*font-feature-settings\s*:[^}]*["']tnum["']\s*(?:1|on)/);
assert.match(css,/@media print/);
console.log('PASS report numeric CSS; actual generated-PDF text and geometry require independent PDF acceptance');
