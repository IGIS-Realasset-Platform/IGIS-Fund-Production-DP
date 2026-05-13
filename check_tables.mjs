import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://qgrszltduzblpvpqvkqr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4xfLdHDF2yMobyRQruJV4A_Q4Fn9m9S';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    // try to get table names if possible, but Anon key usually can't query information_schema easily
    // Let's just query a known table or check if 'project_metrics' or similar exists.
    const tables = ['iota_project_metrics', 'iota_development_metrics', 'project_kpi'];
    for (const t of tables) {
        const { data, error } = await supabase.from(t).select('*').limit(1);
        if (!error) console.log(`Table exists: ${t}`);
    }
}
check();
