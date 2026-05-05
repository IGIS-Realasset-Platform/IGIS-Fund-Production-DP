import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const myUrlMatch = envFile.match(/VITE_SUPABASE_URL=(.+)/);
const myKeyMatch = envFile.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
const myUrl = myUrlMatch[1].trim() + "/rest/v1";
const myKey = myKeyMatch[1].trim();

const code = fs.readFileSync('src/components/system/stakeholder/StakeInternal.jsx', 'utf-8');
const match = code.match(/const stakeholderGroups = (\[[\s\S]*?\]);\n/);
let groups = eval(match[1]);

let mappings = [];
for (const g of groups) {
    for (const m of g.members) {
        mappings.push({ name: m.name, org_name: g.groupTitle });
    }
}
mappings.push({ name: '전기영', org_name: '기획추진' });
mappings.push({ name: '이시정', org_name: '기획추진' });
mappings.push({ name: '이관용', org_name: '기획추진' });

async function updateDb() {
    const res = await fetch(`${myUrl}/iota_seoul_pilot_members?select=*`, {
        headers: { apikey: myKey, Authorization: `Bearer ${myKey}` }
    });
    const dbMembers = await res.json();
    let updateCount = 0;

    for (const dbm of dbMembers) {
        const found = mappings.find(m => m.name === dbm.staff_name);
        if (found && dbm.org_name !== found.org_name) {
            const patchRes = await fetch(`${myUrl}/iota_seoul_pilot_members?id=eq.${dbm.id}`, {
                method: 'PATCH',
                headers: { 
                    apikey: myKey, 
                    Authorization: `Bearer ${myKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ org_name: found.org_name })
            });
            if (patchRes.ok) updateCount++;
        }
    }
    console.log(`Updated ${updateCount} members.`);
}

updateDb();
