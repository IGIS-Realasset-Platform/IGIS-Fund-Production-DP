const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkAndInsert() {
  const { data } = await supabase.from('iota_stakeholder_master').select('*').limit(1);
  console.log("Schema sample:", data);

  const { error: e1 } = await supabase.from('iota_stakeholder_master').insert([
    { contact_name: '홍창의', role_category: 'IGIS 내부인력', company_name: '이지스자산운용' }
  ]);
  const { error: e2 } = await supabase.from('iota_stakeholder_master').insert([
    { contact_name: '김형주', role_category: 'IGIS 내부인력', company_name: '이지스자산운용' }
  ]);

  console.log("Insert errors:", e1, e2);
}
checkAndInsert();
