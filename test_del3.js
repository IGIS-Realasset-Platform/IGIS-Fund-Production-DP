import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

let url = '';
let key = '';

envContent.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});

const supabase = createClient(url, key);

async function testDeleteExisting() {
    // get a real log
    const { data: logs } = await supabase.from('iota_seoul_logs').select('*').limit(1);
    if (!logs || logs.length === 0) return console.log("No logs");
    
    const logId = logs[0].log_id;
    console.log("Found log to delete:", logId);
    
    // Check if it has stakeholders
    const { data: shs } = await supabase.from('iota_seoul_log_stakeholders').select('*').eq('log_id', logId);
    console.log("Stakeholders count:", shs?.length || 0);
    
    // Check if it has links
    const { data: links } = await supabase.from('iota_seoul_log_links').select('*').eq('log_id', logId);
    console.log("Links count:", links?.length || 0);

    // Now try delete stakeholders
    const { data: shData, error: shError, count: shCount } = await supabase.from('iota_seoul_log_stakeholders').delete({ count: 'exact' }).eq('log_id', logId);
    console.log("Stakeholder delete result:", shError, shCount);
    
    // Now try delete links
    const { data: linkData, error: linkError, count: linkCount } = await supabase.from('iota_seoul_log_links').delete({ count: 'exact' }).eq('log_id', logId);
    console.log("Link delete result:", linkError, linkCount);

    // Now try delete log
    const { data: logData, error: logError, count: logCount } = await supabase.from('iota_seoul_logs').delete({ count: 'exact' }).eq('log_id', logId);
    console.log("Log delete result:", logError, logCount);
}

testDeleteExisting();
