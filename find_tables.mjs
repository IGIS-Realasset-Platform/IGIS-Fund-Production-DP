import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://qgrszltduzblpvpqvkqr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4xfLdHDF2yMobyRQruJV4A_Q4Fn9m9S';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    // We don't have access to information_schema with Anon Key easily,
    // so let's try some common table names related to development metrics
    const tables = [
        'iota_project_core',
        'iota_projects',
        'project_summary',
        'development_kpi',
        'iota_milestones',
        'asset_data'
    ];
    for (const t of tables) {
        const { data, error } = await supabase.from(t).select('*').limit(1);
        if (!error) console.log(`Table exists: ${t}`);
    }
}
check();
