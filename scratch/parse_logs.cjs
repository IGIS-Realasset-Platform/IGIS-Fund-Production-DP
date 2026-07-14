async function run() {
    try {
        const res = await fetch('https://qvegpozwrcmspdvjokiz.supabase.co/functions/v1/iota-logs');
        const data = await res.json();
        const logs = data.logs || [];
        
        console.log(`Total logs fetched: ${logs.length}`);
        
        // Group by week or date and count
        const recentLogs = logs.sort((a, b) => new Date(b.work_date) - new Date(a.work_date)).slice(0, 10);
        console.log("\nTop 10 most recent logs:");
        recentLogs.forEach(l => {
            console.log(`- Date: ${l.work_date} | Writer: ${l.writer_name} | Week: ${l.week_key}`);
        });

        // Search for 홍장군
        const hongLogs = logs.filter(l => l.writer_name === '홍장군');
        console.log(`\nFound ${hongLogs.length} logs for 홍장군`);
        hongLogs.forEach(l => {
            console.log(`- Date: ${l.work_date} | Week: ${l.week_key}`);
        });

        // Search for 이시정
        const leeLogs = logs.filter(l => l.writer_name === '이시정');
        console.log(`\nFound ${leeLogs.length} logs for 이시정`);
        leeLogs.forEach(l => {
            console.log(`- Date: ${l.work_date} | Week: ${l.week_key}`);
        });

    } catch (e) {
        console.error(e);
    }
}
run();
