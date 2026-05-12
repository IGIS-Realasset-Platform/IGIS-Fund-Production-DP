import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qgrszltduzblpvpqvkqr.supabase.co';
const supabaseKey = 'sb_publishable_4xfLdHDF2yMobyRQruJV4A_Q4Fn9m9S';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const { data } = await supabase.from('iota_seoul_pilot_members').select('*').limit(5);
    console.log(data);
}

checkData();
