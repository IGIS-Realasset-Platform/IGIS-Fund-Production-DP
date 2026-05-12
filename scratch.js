import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const { data } = await supabase.from('iota_capital_stack').select('*').eq('vehicle_name', '421').eq('phase', 'new');
    console.log(`Loaded ${data.length} rows for 421 new phase`);
}
run();
