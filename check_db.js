import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/jkjeon2025/Documents/GitHub/IGIS Fund Production DP/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase.from('iota_seoul_pilot_members').select('*').limit(1);
  console.log('Members:', data);
}

checkSchema();
