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

async function testDeleteWithStakeholder() {
    // Find a log that has a stakeholder
    const { data: stakeholders } = await supabase.from('iota_seoul_log_stakeholders').select('*').limit(1);
    if (!stakeholders || stakeholders.length === 0) {
        console.log("No stakeholders found");
        return;
    }
    
    const logId = stakeholders[0].log_id;
    console.log(`Found log with stakeholder: ${logId}`);
    
    // First delete from stakeholders
    const { data: shData, error: shError, count: shCount } = await supabase.from('iota_seoul_log_stakeholders').delete({ count: 'exact' }).eq('log_id', logId);
    console.log("Stakeholder delete result:", shError, shCount);
    
    // Then delete from logs
    const { data: logData, error: logError, count: logCount } = await supabase.from('iota_seoul_logs').delete({ count: 'exact' }).eq('log_id', logId);
    console.log("Log delete result:", logError, logCount);
}

testDeleteWithStakeholder();
