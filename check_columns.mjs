import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://qgrszltduzblpvpqvkqr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4xfLdHDF2yMobyRQruJV4A_Q4Fn9m9S';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    const { data, error } = await supabase.from('iota_project_metrics').select('*').limit(1);
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Data:", data);
    }
}
check();
