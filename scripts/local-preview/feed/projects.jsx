import {useSyncExternalStore} from 'react';

const common = {value: 'IOTA_COMMON', label: '공통', projectId: null};

export function savedFeedProject(metadata) {
    const label = metadata?.project_name;
    if (!label || (!metadata.project_id && label === common.label)) return common;
    const projectId = metadata.project_id || null;
    return {value: projectId ? 'project:' + projectId : 'previous', label, projectId};
}

export function feedProjectOptions(registry, metadata, selected) {
    const options = [common, ...registry.map(([id, label]) => ({value: 'project:' + id, label, projectId: id}))];
    const saved = savedFeedProject(metadata);
    if (!options.some(option => option.value === saved.value)) options.push(saved);
    if (selected && !options.some(option => option.value === selected)) {
        options.push({value: selected, label: '프로젝트를 다시 선택해 주세요', disabled: true});
    }
    return options;
}

export function feedProjectLabel(log) {
    const metadata = log.metadata;
    const label = metadata?.project_name;
    if (label) {
        if (metadata.project_id) return label;
        if (label === 'IOTA 427') return '427 PFV';
        if (label === 'IOTA 816') return '816 PFV';
        return label;
    }
    const source = metadata?.workspace_label || metadata?.source_project_text || '';
    if (/816|서울 2|IOTA 2|Two/.test(source)) return '816 PFV';
    return source.includes('421') ? '421 Fund' : '427 PFV';
}

export function feedProjectFilterValue(log) {
    if (log.metadata?.project_id) return 'project:' + log.metadata.project_id;
    const label = feedProjectLabel(log);
    return label === common.label || label === 'IOTA 공통' ? common.value : 'legacy:' + label;
}

export function feedProjectFilterOptions(registered, logs) {
    const counts = new Map();
    for (const {label} of registered) counts.set(label, (counts.get(label) || 0) + 1);
    const options = new Map(registered.map(option => [option.value,
        counts.get(option.label) > 1 && option.projectId ? {...option, label: `${option.label} (${option.projectId})`} : option]));
    for (const log of logs) {
        const value = feedProjectFilterValue(log);
        if (options.has(value)) continue;
        const name = feedProjectLabel(log);
        const label = counts.has(name) ? name + ' (기존)' : name;
        options.set(value, {value, label});
        counts.set(name, (counts.get(name) || 0) + 1);
    }
    return [...options.values()];
}

function projectSnapshot() {
    return window.frameElement?.dataset.feedProjects || '[]';
}

function watchProjects(notify) {
    const frame = window.frameElement;
    if (!frame) return () => {};
    const observer = new MutationObserver(notify);
    observer.observe(frame, {attributes: true, attributeFilter: ['data-feed-projects']});
    return () => observer.disconnect();
}

export function useFeedProjectOptions(metadata, selected) {
    return feedProjectOptions(JSON.parse(useSyncExternalStore(watchProjects, projectSnapshot)), metadata, selected);
}

export function resolveFeedProject(value, metadata) {
    const option = feedProjectOptions(JSON.parse(projectSnapshot()), metadata).find(item => item.value === value);
    if (!option) throw Error('프로젝트 목록에서 다시 선택해 주세요.');
    return option;
}
