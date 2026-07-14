const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qgrszltduzblpvpqvkqr.supabase.co';
const supabaseKey = 'sb_publishable_4xfLdHDF2yMobyRQruJV4A_Q4Fn9m9S';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLogs() {
    const { data: logs, error } = await supabase
        .from('iota_seoul_logs')
        .select('*')
        .ilike('raw_text', '%테스트%')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching logs:', error);
        return;
    }

    console.log('--- RECENT TEST LOGS ---');
    for (const log of logs) {
        console.log(`Log ID: ${log.log_id}`);
        console.log(`Created At: ${log.created_at}`);
        console.log(`Writer: ${log.writer_name} (${log.writer_staff_id})`);
        console.log(`Summary: ${log.summary}`);
        console.log(`Raw Text: ${log.raw_text}`);
        console.log(`Metadata:`, JSON.stringify(log.metadata, null, 2));
        console.log('-------------------');
    }
}

checkLogs();
