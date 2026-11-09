export function isPhaseTwoTask(task) {
    if ((task['작업 이름'] || '').includes('Phase 2') || (task['내용 상세'] || '').includes('Phase 2')) return true;

    // The source ledger contains both YYYY/MM/DD and YYYY-MM-DD dates.
    const date = String(task['마감일'] || '').trim().match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (!date) return false;
    const [, year, month, day] = date;
    return Number(year) * 10000 + Number(month) * 100 + Number(day) >= 20260701;
}
