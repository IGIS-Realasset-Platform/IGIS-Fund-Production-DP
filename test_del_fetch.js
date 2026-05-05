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

async function testFetchAfterDelete() {
    // 1. Insert a test log
    const testLogId = 'test_fetch_after_delete_123';
    const dummyLog = {
        log_id: testLogId,
        writer_name: 'test',
        writer_staff_id: 'test@test.com',
        raw_text: 'Test log for deletion',
        work_date: new Date().toISOString()
    };
    
    await supabase.from('iota_seoul_logs').insert([dummyLog]);
    console.log("Inserted log:", testLogId);

    // 2. Fetch it
    let { data: logs1 } = await supabase.from('iota_seoul_logs').select('*').eq('log_id', testLogId);
    console.log("Fetched before delete, count:", logs1?.length);

    // 3. Delete it exactly like the UI does
    await supabase.from('iota_seoul_log_links').delete().eq('log_id', testLogId);
    await supabase.from('iota_seoul_log_stakeholders').delete().eq('log_id', testLogId);
    const { error: delErr, count } = await supabase.from('iota_seoul_logs').delete({ count: 'exact' }).eq('log_id', testLogId);
    console.log("Delete result:", delErr, count);

    // 4. Fetch it again
    let { data: logs2 } = await supabase.from('iota_seoul_logs').select('*').eq('log_id', testLogId);
    console.log("Fetched after delete, count:", logs2?.length);
}

testFetchAfterDelete();
