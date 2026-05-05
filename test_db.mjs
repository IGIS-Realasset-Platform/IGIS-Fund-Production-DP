import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('iota_seoul_logs').select('*');
  if (error) {
    console.error("Error fetching:", error);
  } else {
    console.log(`Found ${data.length} rows.`);
    if (data.length > 0) {
      console.log(data[0]);
    }
  }
}
test();
