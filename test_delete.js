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

async function testDelete() {
    // get a log to delete
    const { data: logs } = await supabase.from('iota_seoul_logs').select('*').limit(1);
    if (!logs || logs.length === 0) return console.log("No logs to delete");
    const logId = logs[0].log_id;
    console.log(`Trying to delete log ${logId}`);
    
    // try to delete
    const { data, error, count } = await supabase.from('iota_seoul_logs').delete({ count: 'exact' }).eq('log_id', logId);
    console.log("Delete result:", data, error, count);
}

testDelete();
