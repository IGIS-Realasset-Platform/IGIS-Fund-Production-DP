const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qgrszltduzblpvpqvkqr.supabase.co';
const supabaseKey = 'sb_publishable_4xfLdHDF2yMobyRQruJV4A_Q4Fn9m9S';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPolicies() {
    const { data, error } = await supabase
        .rpc('get_policies_for_table', { table_name: 'iota_seoul_logs' });

    if (error) {
        // Fallback: run raw sql if we don't have this function
        console.error('RPC Error:', error);
        
        // Let's try to query using postgrest schema info if available
        const { data: policies, error: polError } = await supabase
            .from('pg_policies')
            .select('*')
            .eq('tablename', 'iota_seoul_logs');
        if (polError) {
            console.error('Postgrest Error:', polError);
        } else {
            console.log(policies);
        }
        return;
    }

    console.log(data);
}

checkPolicies();
