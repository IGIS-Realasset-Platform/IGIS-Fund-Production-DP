import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qgrszltduzblpvpqvkqr.supabase.co';
const supabaseKey = 'sb_publishable_4xfLdHDF2yMobyRQruJV4A_Q4Fn9m9S';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const { data } = await supabase.from('iota_capital_stack').select('*').eq('vehicle_name', '421');
    console.log(data[0]);
}

checkData();
