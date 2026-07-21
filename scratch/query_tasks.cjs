require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function query() {
  const { data, error } = await supabase
    .schema('iota_v2')
    .from('iota_pmo_tasks')
    .select('*')
    .limit(2);
  console.log(JSON.stringify(data, null, 2));
  console.log('Error:', error);
}
query();
