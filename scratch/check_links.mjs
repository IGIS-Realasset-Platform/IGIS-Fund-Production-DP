import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://qgrszltduzblpvpqvkqr.supabase.co';
const supabaseKey = 'sb_publishable_4xfLdHDF2yMobyRQruJV4A_Q4Fn9m9S';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    let res = await supabase.from('iota_seoul_log_links').select('*').limit(1);
    console.log("Log links columns:", res.data ? Object.keys(res.data[0] || {}) : res.error);
}
run();
