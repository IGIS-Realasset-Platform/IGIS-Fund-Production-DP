import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Load env
const envFile = fs.readFileSync('./.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("=== Querying iota_departments in iota_v2 schema ===");
  const { data: depts, error } = await supabase
    .schema('iota_v2')
    .from('iota_departments')
    .select('*');

  if (error) {
    console.error("Query Error:", error);
  } else {
    console.log("Departments in DB:", depts);
  }
}

run();
