import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [k, ...v] = line.split('=');
    if (k && v) {
      env[k.trim()] = v.join('=').trim().replace(/^"|"$|'$|^'/g, '');
    }
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase
    .from('iota_capital_stack')
    .select('*')
    .eq('vehicle_name', '816')
    .eq('phase', 'Refinancing');
  
  console.log("816 Refinancing Count:", data ? data.length : "error", error);
}
check();
