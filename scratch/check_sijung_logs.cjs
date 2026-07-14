const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '../.env.local');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf8');
} catch (e) {
    envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
}

const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Fetching logs for 이시정...');
    
    const { data: logs, error } = await supabase
        .from('iota_seoul_logs')
        .select('*')
        .eq('writer_name', '이시정')
        .order('work_date', { ascending: false })
        .limit(10);
        
    if (error) {
        console.error('Error fetching logs:', error);
        return;
    }
    
    console.log(`Found ${logs.length} logs for 이시정.`);
    for (const log of logs) {
        console.log(`- Date: ${log.work_date} | Title: ${log.title} | ID: ${log.log_id}`);
    }
}

run();
