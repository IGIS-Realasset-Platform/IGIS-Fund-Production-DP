const DIRECTOR_LOGS_ENDPOINT = 'https://qvegpozwrcmspdvjokiz.supabase.co/functions/v1/iota-logs';
const CACHE_TTL_MS = 5 * 60 * 1000;

export const DIRECTOR_LOG_LINE_ORDER = [
    '사업 PM 1',
    '사업 PM 2',
    '파이낸싱-LFC',
    '개발솔루션-DSC',
    '기업마케팅-EMC',
    '공간솔루션-SSC',
    '펀드운용-KAM',
    'IPR-WG',
    '기획추진',
    'CFT 총괄',
    '공통',
];

const STAFF_CELL_MAP = {
    '전기영': '기획추진', '이시정': '기획추진', '이관용': '기획추진',
    '이철승': 'CFT 총괄', '윤관식': 'CFT 총괄', '정조민': 'CFT 총괄', '우형석': 'CFT 총괄',
    '권순일': '사업 PM 1', '윤주형': '사업 PM 1', '김제익': '사업 PM 1', '류홍': '사업 PM 1', '박만진': '사업 PM 1', '박일훈': '사업 PM 1', '이정원': '사업 PM 1', '전무경': '사업 PM 1',
    '강순용': '사업 PM 2', '한찬호': '사업 PM 2', '박석제': '사업 PM 2', '박채현': '사업 PM 2', '소현준': '사업 PM 2', '이수정': '사업 PM 2', '조영비': '사업 PM 2', '한수정': '사업 PM 2',
    '박준호': '파이낸싱-LFC', '강석민': '파이낸싱-LFC', '정리훈': '파이낸싱-LFC', '손유정': '파이낸싱-LFC', '김지우': '파이낸싱-LFC', '박현승': '파이낸싱-LFC', '이성민A': '파이낸싱-LFC', '한승환': '파이낸싱-LFC',
    '홍장군': '개발솔루션-DSC', '채원': '개발솔루션-DSC', '김보성': '개발솔루션-DSC', '전승희': '개발솔루션-DSC', '김대익': '개발솔루션-DSC', '장성진': '개발솔루션-DSC', '이정훈': '개발솔루션-DSC', '박봉서': '개발솔루션-DSC', '김형주': '개발솔루션-DSC',
    '김민지': '기업마케팅-EMC', '고아라': '기업마케팅-EMC',
    '김현수': '공간솔루션-SSC', '현철호': '공간솔루션-SSC', '신민호': '공간솔루션-SSC', '이가현': '공간솔루션-SSC', '정수명': '공간솔루션-SSC',
    '김행단': '펀드운용-KAM', '윤용택': 'IPR-WG',
};

let cachedLogs = null;
let cachedAt = 0;
let pendingRequest = null;

export const getDirectorStaffCell = (name) => STAFF_CELL_MAP[name] || '공통';

export const getDirectorLogCell = (log) => {
    const workspaceCode = String(log?.metadata?.workspace_code || '').toUpperCase();
    if (workspaceCode === 'WS_PM1' || workspaceCode === 'PM1' || workspaceCode === 'PM_1') return '사업 PM 1';
    if (workspaceCode === 'WS_PM2' || workspaceCode === 'PM2' || workspaceCode === 'PM_2') return '사업 PM 2';
    if (workspaceCode === 'WS_PM' || workspaceCode === 'PM') {
        return getDirectorStaffCell(log?.writer_name) === '사업 PM 2' ? '사업 PM 2' : '사업 PM 1';
    }
    if (workspaceCode.includes('FINANCING') || workspaceCode.includes('LFC')) return '파이낸싱-LFC';
    if (workspaceCode.includes('DEVELOPMENT') || workspaceCode.includes('DSC')) return '개발솔루션-DSC';
    if (workspaceCode.includes('MARKETING') || workspaceCode.includes('EMC')) return '기업마케팅-EMC';
    if (workspaceCode.includes('DIGITAL') || workspaceCode.includes('SSC')) return '공간솔루션-SSC';
    if (workspaceCode.includes('FUND') || workspaceCode.includes('KAM')) return '펀드운용-KAM';
    if (workspaceCode.includes('IPR')) return 'IPR-WG';

    const workspaceLabel = String(log?.metadata?.workspace_label || '');
    if (workspaceLabel.includes('사업 PM 1') || workspaceLabel.includes('사업PM 1') || workspaceLabel.includes('사업PM1')) return '사업 PM 1';
    if (workspaceLabel.includes('사업 PM 2') || workspaceLabel.includes('사업PM 2') || workspaceLabel.includes('사업PM2')) return '사업 PM 2';
    if (workspaceLabel.includes('사업 PM') || workspaceLabel.includes('사업PM')) {
        return getDirectorStaffCell(log?.writer_name) === '사업 PM 2' ? '사업 PM 2' : '사업 PM 1';
    }
    if (workspaceLabel.includes('파이낸싱')) return '파이낸싱-LFC';
    if (workspaceLabel.includes('개발솔루션')) return '개발솔루션-DSC';
    if (workspaceLabel.includes('기업마케팅')) return '기업마케팅-EMC';
    if (workspaceLabel.includes('공간솔루션') || workspaceLabel.includes('상품/디지털') || workspaceLabel.includes('상품·디지털')) return '공간솔루션-SSC';
    if (workspaceLabel.includes('펀드운용')) return '펀드운용-KAM';
    if (workspaceLabel.includes('IPR')) return 'IPR-WG';
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
        return getDirectorLogCell(log) === '사업 PM 2'
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
    const availableLines = new Set((logs || []).map((log) => log.line).filter(Boolean));
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
