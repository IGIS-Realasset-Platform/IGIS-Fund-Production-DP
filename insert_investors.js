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

async function insertInvestors() {
    console.log('Fetching counterparties...');
    
    let allCounterparties = [];
    let hasMore = true;
    let page = 0;
    const pageSize = 1000;
    
    while (hasMore) {
        const { data, error } = await supabase.from('counterparties').select('*').range(page * pageSize, (page + 1) * pageSize - 1);
        if (error) {
            console.error('Error fetching counterparties:', error);
            return;
        }
        if (data.length === 0) {
            hasMore = false;
        } else {
            allCounterparties.push(...data);
            page++;
        }
    }

    console.log(`Found ${allCounterparties.length} counterparties.`);

    // Map to stakeholder_master format
    const recordsToInsert = allCounterparties.map(c => {
        let role = '기타';
        if (c.category === 'LP') role = '투자자';
        else if (c.category === 'Lender') role = '대주';
        else if (c.name.includes('운용') || c.name.includes('자산')) role = '운영 파트너';
        else role = '투자자'; // Default to 투자자 just in case
        
        return {
            company_name: c.name.trim(),
            contact_name: null,
            role_category: role
        };
    }).filter(r => r.company_name); // must have a name

    // Filter unique companies
    const unique = [];
    const seen = new Set();
    for (const r of recordsToInsert) {
        const key = r.company_name; // Since contact_name is null
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(r);
        }
    }

    console.log(`Inserting ${unique.length} investor records into iota_stakeholder_master...`);
    
    let insertCount = 0;
    for (let i = 0; i < unique.length; i += 100) {
        const chunk = unique.slice(i, i + 100);
        const { error: insError } = await supabase.from('iota_stakeholder_master').insert(chunk);
        if (insError) {
            // Some might fail due to unique constraint if already inserted
            console.error('Insert chunk error (might be duplicates):', insError.message);
        } else {
            insertCount += chunk.length;
        }
    }
    
    console.log(`Successfully inserted ${insertCount} records!`);
}

insertInvestors();
