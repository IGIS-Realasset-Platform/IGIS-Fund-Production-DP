import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('/Users/jkjeon2025/Documents/GitHub/IGIS Fund Production DP/.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase.from('iota_seoul_pilot_members').select('staff_name, org_name, role_code');
  if (error) console.error(error);
  else {
    const orgs = [...new Set(data.map(d => d.org_name))];
    console.log('Distinct Organizations:', orgs);
    console.log('All members:', data);
  }
}
checkSchema();

