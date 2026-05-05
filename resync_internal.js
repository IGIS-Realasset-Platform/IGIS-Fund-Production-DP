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

async function resyncOnlyInternal() {
    console.log('1. Truncating master table...');
    // We can't TRUNCATE via standard JS client easily, so we will fetch all IDs and delete in loop, or delete by condition.
    // Actually, deleting where id is not null works up to 1000. Loop it until 0.
    let hasMore = true;
    while(hasMore) {
        const { data } = await supabase.from('iota_stakeholder_master').select('id').limit(1000);
        if (!data || data.length === 0) {
            hasMore = false;
        } else {
            console.log(`Deleting ${data.length} records...`);
            const ids = data.map(d => d.id);
            for (let i=0; i<ids.length; i+=100) {
                const chunk = ids.slice(i, i+100);
                await supabase.from('iota_stakeholder_master').delete().in('id', chunk);
            }
        }
    }
    console.log('Truncate complete.');

    console.log('2. Fetching internal staff from iota_members...');
    const { data: members, error: memError } = await supabase.from('iota_members').select('*');
    if (memError) {
        console.error(memError);
        return;
    }

    console.log(`Found ${members.length} internal staff.`);

    const recordsToInsert = members.map(m => ({
        company_name: '이지스자산운용',
        contact_name: m.staff_name,
        role_category: 'IGIS 내부인력'
    })).filter(r => r.contact_name);

    // unique logic
    const unique = [];
    const seen = new Set();
    for (const r of recordsToInsert) {
        const key = r.company_name + '|' + r.contact_name;
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(r);
        }
    }

    console.log(`Inserting ${unique.length} internal staff records...`);
    const { error: insError } = await supabase.from('iota_stakeholder_master').insert(unique);
    if (insError) {
        console.error(insError);
    } else {
        console.log('Done resyncing internal staff!');
    }
}

resyncOnlyInternal();
