import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Load env
const envFile = fs.readFileSync('/Users/jkjeon2025/Documents/GitHub/IGIS Fund Production DP/.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("=== Inserting 기획추진 (DEPT_PO) into iota_v2.iota_departments ===");
  
  const payload = {
    dept_code: 'DEPT_PO',
    dept_name: '기획추진'
  };

  const { data, error } = await supabase
    .schema('iota_v2')
    .from('iota_departments')
    .insert([payload])
    .select();

  if (error) {
    console.error("Insert Error:", error);
  } else {
    console.log("Insert Success!", data);
  }
}

run();
