import {
    getIotaOrganizationByStaff,
    getIotaOrganizationFromWorkspace,
    IOTA_ORGANIZATION_ORDER,
    normalizeIotaOrganization,
} from './iotaOrganizations.js';

const DIRECTOR_LOGS_ENDPOINT = 'https://qvegpozwrcmspdvjokiz.supabase.co/functions/v1/iota-logs';
const CACHE_TTL_MS = 5 * 60 * 1000;

export const DIRECTOR_LOG_LINE_ORDER = IOTA_ORGANIZATION_ORDER;

let cachedLogs = null;
let cachedAt = 0;
let pendingRequest = null;

export const getDirectorStaffCell = (name) => getIotaOrganizationByStaff(name);

export const getDirectorLogCell = (log) => {
    const workspaceCode = String(log?.metadata?.workspace_code || '').toUpperCase();
    if (workspaceCode === 'WS_PM1' || workspaceCode === 'PM1' || workspaceCode === 'PM_1') return '사업1파트';
    if (workspaceCode === 'WS_PM2' || workspaceCode === 'PM2' || workspaceCode === 'PM_2') return '사업2파트';
    if (workspaceCode === 'WS_PM' || workspaceCode === 'PM') {
        return getDirectorStaffCell(log?.writer_name) === '사업2파트' ? '사업2파트' : '사업1파트';
    }
    const organizationByCode = getIotaOrganizationFromWorkspace(workspaceCode, log?.writer_name);
    if (organizationByCode) return organizationByCode;

    const workspaceLabel = String(log?.metadata?.workspace_label || '');
    if (workspaceLabel.includes('사업 PM 1') || workspaceLabel.includes('사업PM 1') || workspaceLabel.includes('사업PM1')) return '사업1파트';
    if (workspaceLabel.includes('사업 PM 2') || workspaceLabel.includes('사업PM 2') || workspaceLabel.includes('사업PM2')) return '사업2파트';
    if (workspaceLabel.includes('사업 PM') || workspaceLabel.includes('사업PM')) {
        return getDirectorStaffCell(log?.writer_name) === '사업2파트' ? '사업2파트' : '사업1파트';
    }
    const organizationByLabel = normalizeIotaOrganization(workspaceLabel);
    if (IOTA_ORGANIZATION_ORDER.includes(organizationByLabel)) return organizationByLabel;
    return getDirectorStaffCell(log?.writer_name);
};

const getFirstContentLine = (value) => String(value || '')
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean) || '';

export const getDirectorLogTitle = (log) => {
    const title = String(log?.title || '').trim();
    if (title && title !== '-' && title !== '—') return title;
    return getFirstContentLine(log?.summary)
        || getFirstContentLine(log?.raw_text)
        || getFirstContentLine(log?.body_text)
        || '업무 로그';
};

export const formatDirectorLogText = (value) => {
    let formatted = String(value || '');
    formatted = formatted.replace(/\s+([가-하])\.\s+/g, '\n$1. ');
    formatted = formatted.replace(/\s+(\d+)\)\s+/g, '\n$1) ');
    return formatted.replace(/\n+/g, '\n').trim();
};

export const normalizeDirectorWorkflowLog = (log) => {
    const sourceLine = String(log?.line || '').trim();
    const workspaceLabel = String(log?.metadata?.workspace_label || '').split('-')[0].trim();
    const displayText = formatDirectorLogText(log?.raw_text || log?.body_text || log?.summary || '');

    return {
        ...log,
        id: log?.id || log?.log_id,
        source_line: sourceLine,
        line: getDirectorLogCell(log),
        category: workspaceLabel || log?.task_type || sourceLine || '공통',
        title: getDirectorLogTitle(log),
        display_text: displayText,
    };
};

const getLogTime = (log, field) => {
    const time = new Date(log?.[field] || 0).getTime();
    return Number.isNaN(time) ? 0 : time;
};

export const compareDirectorWorkflowLogs = (firstLog, secondLog) => {
    const workDateDifference = getLogTime(secondLog, 'work_date') - getLogTime(firstLog, 'work_date');
    if (workDateDifference !== 0) return workDateDifference;
    const updatedAtDifference = getLogTime(secondLog, 'updated_at') - getLogTime(firstLog, 'updated_at');
    if (updatedAtDifference !== 0) return updatedAtDifference;
    return String(firstLog?.id || '').localeCompare(String(secondLog?.id || ''));
};

export const getDirectorWorkspacePath = (log) => {
    const workspaceCode = String(log?.metadata?.workspace_code || '').toLowerCase();
    if (['ws_pm2', 'pm2', 'pm_2'].includes(workspaceCode)) return 'platform/iotaseoul/workspace/pm2';
    if (['ws_pm1', 'pm1', 'pm_1'].includes(workspaceCode)) return 'platform/iotaseoul/workspace/pm1';
    if (['ws_pm', 'pm'].includes(workspaceCode)) {
        return getDirectorLogCell(log) === '사업2파트'
            ? 'platform/iotaseoul/workspace/pm2'
            : 'platform/iotaseoul/workspace/pm1';
    }
    if (workspaceCode.includes('financing') || workspaceCode.includes('lfc')) return 'platform/iotaseoul/workspace/financing';
    if (workspaceCode.includes('development') || workspaceCode.includes('dsc')) return 'platform/iotaseoul/workspace/development';
    if (workspaceCode.includes('marketing') || workspaceCode.includes('emc')) return 'platform/iotaseoul/workspace/marketing';
    if (workspaceCode.includes('digital') || workspaceCode.includes('ssc')) return 'platform/iotaseoul/workspace/digital';
    if (workspaceCode.includes('fund') || workspaceCode.includes('kam')) return 'platform/iotaseoul/workspace/fund';
    if (workspaceCode.includes('ipr')) return 'platform/iotaseoul/workspace/ipr';
    return null;
};

export const getDirectorLogLineOptions = (logs) => {
    const availableLines = new Set(
        (logs || [])
            .map((log) => normalizeIotaOrganization(log.line))
            .filter(Boolean)
    );
    const orderedLines = DIRECTOR_LOG_LINE_ORDER.filter((line) => availableLines.has(line));
    const additionalLines = [...availableLines]
        .filter((line) => !DIRECTOR_LOG_LINE_ORDER.includes(line))
        .sort((firstLine, secondLine) => firstLine.localeCompare(secondLine, 'ko'));
    return ['전체', ...orderedLines, ...additionalLines];
};

export const fetchDirectorWorkflowLogs = async ({ force = false, timeoutMs = 20000 } = {}) => {
    const now = Date.now();
    if (!force && cachedLogs && now - cachedAt < CACHE_TTL_MS) return cachedLogs;
    if (!force && pendingRequest) return pendingRequest;

    const request = (async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(DIRECTOR_LOGS_ENDPOINT, { signal: controller.signal });
            if (!response.ok) throw new Error(`업무보고 서버 오류 (${response.status})`);
            const data = await response.json();
            if (!Array.isArray(data?.logs)) throw new Error('업무보고 응답 형식이 올바르지 않습니다.');

            const normalizedLogs = data.logs
                .map(normalizeDirectorWorkflowLog)
                .filter((log) => log.id)
                .sort(compareDirectorWorkflowLogs);
            cachedLogs = normalizedLogs;
            cachedAt = Date.now();
            return normalizedLogs;
        } catch (error) {
            if (error?.name === 'AbortError') {
                throw new Error('업무보고 서버 응답 시간이 초과되었습니다.');
            }
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    })();

    pendingRequest = request;
    try {
        return await request;
    } finally {
        if (pendingRequest === request) pendingRequest = null;
    }
};
