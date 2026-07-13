import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://qgrszltduzblpvpqvkqr.supabase.co';
const supabaseKey = 'sb_publishable_4xfLdHDF2yMobyRQruJV4A_Q4Fn9m9S';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Popup schema iota_v2:");
    let res = await supabase.schema('iota_v2').from('iota_pmo_popup_requests').select('created_at').limit(1);
    console.log(res.data ? Object.keys(res.data[0] || {}) : res.error);
    
    let res2 = await supabase.schema('iota_v2').from('iota_pmo_popup_requests').select('updated_at').limit(1);
    console.log(res2.data ? Object.keys(res2.data[0] || {}) : res2.error);
}
run();
