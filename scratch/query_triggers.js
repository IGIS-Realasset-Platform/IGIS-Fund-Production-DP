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
  console.log("=== Querying database triggers ===");
  
  // We can select from pg_trigger using a raw SQL or check functions
  // But wait, supabase client doesn't support raw SQL queries unless we use a function.
  // Wait, let's query the last 5 rows of iota_notifications to see what is stored!
  const { data: notifs, error } = await supabase
    .from('iota_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error("Query Error:", error);
  } else {
    console.log("Recent notifications:");
    console.table(notifs);
  }
}

run();
