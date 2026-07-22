const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const envPath = path.join(__dirname, '../.env.local');
let envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
});
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
async function run() {
    const { data: logs } = await supabase
        .from('iota_seoul_logs')
        .select('*')
        .eq('metadata->>task_id', 'b405ecd9-b319-46d0-b75d-c880d56cbcb3')
        .order('created_at', { ascending: false })
        .limit(5);
    console.log(JSON.stringify(logs.map(l => ({ id: l.log_id, meta: l.metadata, created: l.created_at })), null, 2));
}
run();
