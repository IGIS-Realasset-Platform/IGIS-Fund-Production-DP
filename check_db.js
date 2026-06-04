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

async function checkColumns() {
  const { data, error } = await supabase
    .from('iota_notifications')
    .select('*')
    .limit(1); // RLS might prevent this but let's check error or column list
    
  if (error) {
    console.error("Direct fetch error:", error);
  } else {
    console.log("Direct fetch sample:", data);
  }

  // Query information_schema via RPC or check if we can query custom table or if we have another table
  // Let's run a select on information_schema.columns if exposed.
  // PostgREST typically doesn't expose information_schema by default, but let's see.
  const { data: schemaData, error: schemaError } = await supabase
    .from('information_schema.columns')
    .select('column_name')
    .eq('table_name', 'iota_notifications');
    
  if (schemaError) {
    console.error("Schema query error (expected if blocked):", schemaError);
  } else {
    console.log("Schema columns:", schemaData);
  }
}

checkColumns();
