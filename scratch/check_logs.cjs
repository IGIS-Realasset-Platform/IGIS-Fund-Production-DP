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
    console.log('Fetching recent auto-heal logs...');
    const { data: logs, error } = await supabase
        .from('iota_seoul_logs')
        .select('log_id, writer_name, raw_text, created_at')
        .eq('writer_staff_id', 'system_auto')
        .order('created_at', { ascending: false })
        .limit(50);
        
    if (error) {
        console.error('Error fetching logs:', error);
        return;
    }
    
    console.log(`Found ${logs.length} auto-heal logs.`);
    for (const log of logs) {
        console.log(`- ${log.created_at} | ${log.log_id} | ${log.writer_name}: ${log.raw_text}`);
    }
}

run();
