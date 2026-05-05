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

async function checkCounterparties() {
    console.log('Fetching counterparties...');
    const { data, error } = await supabase.from('counterparties').select('*').limit(10);
    if (error) {
        console.error(error);
        return;
    }
    console.log(data);
    
    // Also check how many counterparties there are
    const { count } = await supabase.from('counterparties').select('*', { count: 'exact', head: true });
    console.log(`Total counterparties: ${count}`);
}

checkCounterparties();
