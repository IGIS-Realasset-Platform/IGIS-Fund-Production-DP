import { createClient } from '@supabase/supabase-js'
async function run() {
    const sb = createClient('https://qgrszltduzblpvpqvkqr.supabase.co', 'sb_publishable_4xfLdHDF2yMobyRQruJV4A_Q4Fn9m9S');
    const { data: tasks, error: fetchErr } = await sb.from('iota_pm_tasks').select('*');
    if (fetchErr) {
        console.error("Fetch Error:", fetchErr);
        return;
    }
    console.log(`Found ${tasks ? tasks.length : 0} tasks in iota_pm_tasks`);
}
run();
