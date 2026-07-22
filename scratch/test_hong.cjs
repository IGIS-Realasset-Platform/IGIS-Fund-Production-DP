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
    const { data, error } = await supabase
        .from('iota_seoul_pilot_members')
        .select('*')
        .or('staff_name.ilike.%홍장군%,staff_name.ilike.%홍%');
    console.log("Members matching 홍:", data, error);
}
run();
