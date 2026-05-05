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

async function inspectDB() {
    console.log('Fetching all records...');
    const { data: allRecords, error } = await supabase.from('iota_stakeholder_master').select('*').limit(5000);
    
    if (error) {
        console.error(error);
        return;
    }

    console.log(`Total records: ${allRecords.length}`);
    
    const weird = allRecords.filter(r => r.contact_name && r.contact_name.length > 10);
    console.log(`Found ${weird.length} weird contacts (length > 10)`);
    if (weird.length > 0) {
        console.log(weird.map(r => r.contact_name).slice(0, 5));
    }

    const kang = allRecords.filter(r => r.contact_name === '강순용');
    console.log(`Found ${kang.length} records for '강순용'`);
    if (kang.length > 0) {
        console.log(kang);
    }

    // Nuke everything that is NOT an internal staff, AND any internal staff with weird names.
    // Actually, the user just wants the dropdown to have 40 internal staff.
    // I will delete EVERYTHING from the master table, and let the sync script re-run BUT ONLY for internal staff.
}

inspectDB();
