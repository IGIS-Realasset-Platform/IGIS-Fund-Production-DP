import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://qgrszltduzblpvpqvkqr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4xfLdHDF2yMobyRQruJV4A_Q4Fn9m9S';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkDB() {
    const { data, error } = await supabase
        .from('iota_capital_stack')
        .select('*')
        .eq('vehicle_name', '816');
    if (error) console.error(error);
    else console.log('Rows count 816:', data.length);
}
checkDB();
