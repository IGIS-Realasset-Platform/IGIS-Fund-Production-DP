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

async function cleanContacts() {
    console.log('Fetching all records...');
    const { data: allRecords, error } = await supabase.from('iota_stakeholder_master').select('*').limit(5000);
    
    if (error) {
        console.error(error);
        return;
    }

    const externals = allRecords.filter(r => r.role_category !== 'IGIS 내부인력');
    
    // Find companies that have no "null" contact record
    const companyHasNull = new Set(externals.filter(r => !r.contact_name).map(r => r.company_name));
    
    const missingNullCompanies = [...new Set(externals.filter(r => !companyHasNull.has(r.company_name)).map(r => r.company_name))];
    
    console.log(`Inserting base company records for ${missingNullCompanies.length} companies...`);
    for (const comp of missingNullCompanies) {
        const ref = externals.find(r => r.company_name === comp);
        await supabase.from('iota_stakeholder_master').insert({
            company_name: comp,
            contact_name: null,
            role_category: ref.role_category
        });
    }

    const externalContactsToDelete = externals.filter(r => r.contact_name);
    console.log(`Deleting ${externalContactsToDelete.length} external contact records...`);
    
    let delCount = 0;
    for (const record of externalContactsToDelete) {
        await supabase.from('iota_stakeholder_master').delete().eq('id', record.id);
        delCount++;
    }
    
    console.log(`Done! Deleted ${delCount} external contacts.`);
}

cleanContacts();
