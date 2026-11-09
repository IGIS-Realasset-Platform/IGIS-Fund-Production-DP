import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import React, { useState, useEffect, useRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { transform } from 'esbuild';
import { tasksData } from '../src/components/system/admin/tasksData.js';
import { isPhaseTwoTask } from '../src/utils/projectTaskPhase.js';

for (const date of ['2026-07-01', '2026/07/01', '2026-11-09', '2026/11/09', '2026/7/1']) {
    assert.equal(isPhaseTwoTask({ '마감일': date }), true, date);
}
for (const date of ['2026-06-30', '2026/06/30', '', undefined]) {
    assert.equal(isPhaseTwoTask({ '마감일': date }), false, String(date));
}
assert(isPhaseTwoTask({ '작업 이름': 'Phase 2 이전 기록' }));
assert(isPhaseTwoTask({ '내용 상세': 'Phase 2 전환' }));

// Render the actual table without opening another website or requiring login.
const source = await fs.readFile('src/components/system/admin/SystemAdmin.jsx', 'utf8');
const component = source.slice(source.indexOf('function ProjectTasksView()'));
const { code } = await transform(component, { loader: 'jsx', jsx: 'transform' });
const View = new Function('React', 'useState', 'useEffect', 'useRef', 'tasksData', 'isPhaseTwoTask', `${code}\nreturn ProjectTasksView;`)(React, useState, useEffect, useRef, tasksData, isPhaseTwoTask);
const html = renderToStaticMarkup(React.createElement(View));
const tbody = html.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/)[1];
const renderedRows = [...tbody.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].map(m => m[1]).filter(row => !row.includes('colSpan="5"'));
const topics = tasksData.filter(t => t['작업 이름'].startsWith('[11/09 통합기록] ')).reverse();
assert.equal(topics.length, 5);
for (const [index, task] of topics.entries()) {
    assert(renderedRows[index].includes(task['작업 이름']), `Topic ${index + 1} must appear in row ${index + 1}`);
    assert(isPhaseTwoTask(task), `Topic ${index + 1} must pass the Phase 2 filter`);
}
console.log('PASS: mixed date formats, phase boundary, legacy phase labels, actual table first five rows in priority order.');
