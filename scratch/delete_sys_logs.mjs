import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qgrszltduzblpvpqvkqr.supabase.co';
const supabaseKey = 'sb_publishable_4xfLdHDF2yMobyRQruJV4A_Q4Fn9m9S'; // Anon key
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Deleting system logs...");
    const { data, error } = await supabase
        .from('iota_seoul_logs')
        .delete()
        .in('writer_staff_id', ['system', 'system_auto']);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Success! Logs deleted.");
    }
}

run();
