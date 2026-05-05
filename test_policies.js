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

async function verifyPolicies() {
    // Let's insert a dummy log and try to delete it
    const dummyLog = {
        log_id: 'test_delete_123',
        writer_name: 'test',
        writer_staff_id: 'test@test.com',
        raw_text: 'Test log for deletion',
        work_date: new Date().toISOString()
    };
    
    // Insert
    const { error: insertError } = await supabase.from('iota_seoul_logs').insert([dummyLog]);
    console.log("Insert error:", insertError);
    
    // Delete
    const { data, error: deleteError, count } = await supabase.from('iota_seoul_logs').delete({ count: 'exact' }).eq('log_id', 'test_delete_123');
    console.log("Delete result:", deleteError, count);
}

verifyPolicies();
