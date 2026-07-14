const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qgrszltduzblpvpqvkqr.supabase.co';
const supabaseKey = 'sb_publishable_4xfLdHDF2yMobyRQruJV4A_Q4Fn9m9S';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMembership() {
    // 1. Fetch workspaces
    const { data: workspaces, error: wsError } = await supabase
        .from('iota_seoul_workspaces')
        .select('*');

    if (wsError) {
        console.error('Error fetching workspaces:', wsError);
    } else {
        console.log('--- WORKSPACES ---');
        console.log(workspaces);
    }

    // 2. Fetch members for WS_PMO
    const { data: members, error: memError } = await supabase
        .from('iota_seoul_workspace_members')
        .select('*')
        .eq('workspace_code', 'WS_PMO');

    if (memError) {
        console.error('Error fetching members:', memError);
    } else {
        console.log('--- WS_PMO MEMBERS ---');
        console.log(members);
    }
}

checkMembership();
