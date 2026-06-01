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

async function updateSchema() {
  const { data, error } = await supabase
    .from('iota_seoul_pilot_members')
    .update({ org_name: '상품·디지털' })
    .eq('staff_name', '이가현')
    .select('staff_name, org_name');
    
  if (error) console.error(error);
  else console.log('Updated:', data);
}
updateSchema();
