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

async function syncMembers() {
    console.log('Fetching internal staff from iota_seoul_pilot_members...');
    const { data: members, error: memError } = await supabase.from('iota_seoul_pilot_members').select('*');
    if (memError) {
        console.error('Failed to fetch members:', memError);
        return;
    }

    console.log(`Found ${members.length} internal staff.`);

    // Prepare records
    const recordsToInsert = members.map(m => ({
        company_name: '이지스자산운용',
        contact_name: m.staff_name,
        role_category: 'IGIS 내부인력'
    })).filter(r => r.contact_name);

    // Filter unique
    const unique = [];
    const seen = new Set();
    for (const r of recordsToInsert) {
        const key = r.company_name + '|' + r.contact_name;
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(r);
        }
    }

    console.log(`Inserting ${unique.length} internal staff records into iota_stakeholder_master...`);
    
    // Insert in chunks of 100 just to be safe
    let insertCount = 0;
    for (let i = 0; i < unique.length; i += 100) {
        const chunk = unique.slice(i, i + 100);
        const { error: insError } = await supabase.from('iota_stakeholder_master').insert(chunk);
        if (insError) {
            console.error('Insert error:', insError);
        } else {
            insertCount += chunk.length;
        }
    }
    
    console.log(`Successfully inserted ${insertCount} records!`);
}

syncMembers();
