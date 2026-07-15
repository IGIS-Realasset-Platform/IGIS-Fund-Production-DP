const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://qgrszltduzblpvpqvkqr.supabase.co';
const supabaseKey = 'sb_publishable_4xfLdHDF2yMobyRQruJV4A_Q4Fn9m9S';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkHong() {
    const { data, error } = await supabase
        .from('iota_seoul_pilot_members')
        .select('staff_name, email, auth_id')
        .like('staff_name', '%홍%');
    console.log(data);
}
checkHong();
