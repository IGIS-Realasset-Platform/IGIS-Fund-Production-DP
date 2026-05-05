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

async function listTables() {
    // We can query a known table that might contain LP/Lender data.
    // Let's try to query 'iota_427_lp', 'iota_427_lender', 'iota_stakeholder_lp', etc.
    const tablesToTry = ['iota_427_lp', 'iota_stakeholders', 'iota_investors', 'iota_seoul_stakeholders', 'iota_seoul_lp'];
    
    for (const t of tablesToTry) {
        const { data, error } = await supabase.from(t).select('*').limit(1);
        if (error) {
            console.log(`Table ${t} error:`, error.message);
        } else {
            console.log(`Table ${t} exists. Data:`, data);
        }
    }
}

listTables();
