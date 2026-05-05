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

async function checkFK() {
    // See if there's any other table starting with iota_seoul_log
    // We can't query information_schema from anon key.
    // Let's try to query iota_seoul_log_tags
    const { data: tags, error: tErr } = await supabase.from('iota_seoul_log_tags').select('*').limit(1);
    console.log("tags:", tErr ? tErr.message : "Exists");
}

checkFK();
