const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qgrszltduzblpvpqvkqr.supabase.co';
const supabaseKey = 'sb_publishable_4xfLdHDF2yMobyRQruJV4A_Q4Fn9m9S';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTask() {
    const { data: tasks, error } = await supabase
        .from('iota_pmo_tasks')
        .select('*')
        .limit(3);

    if (error) {
        console.error('Error fetching tasks:', error);
        return;
    }

    console.log('--- PUBLIC TASKS ---');
    console.log(tasks);
    console.log('-------------------');
}

checkTask();
