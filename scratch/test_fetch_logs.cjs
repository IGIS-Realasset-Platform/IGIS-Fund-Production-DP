const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qgrszltduzblpvpqvkqr.supabase.co';
const supabaseKey = 'sb_publishable_4xfLdHDF2yMobyRQruJV4A_Q4Fn9m9S';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
    const { data: logs, error } = await supabase
        .from('iota_seoul_logs')
        .select('*, iota_seoul_log_stakeholders(sh_name, role_category)')
        .eq('metadata->>task_id', '050cd579-5bc6-4dcb-a92a-30038f3c874a')
        .order('work_date', { ascending: true })
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Fetch Error:', error);
        return;
    }

    console.log(`Matched logs for task: ${logs.length}`);
    if (logs.length > 0) {
        console.log(logs[0]);
    }
}

testFetch();
