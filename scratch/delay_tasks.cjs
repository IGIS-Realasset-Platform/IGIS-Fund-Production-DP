const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '../.env.local');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf8');
} catch (e) {
    envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
}

const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Fetching tasks...');
    
    // Fallback to public schema iota_seoul_pmo_tasks since iota_v2 had 0 tasks
    const { data: tasks, error } = await supabase
        .from('iota_seoul_pmo_tasks')
        .select('*');
        
    if (error) {
        console.error('Error fetching tasks:', error);
        
        // try iota_pmo_tasks in public schema
        const { data: tasks2, error: error2 } = await supabase
            .from('iota_pmo_tasks')
            .select('*');
            
        if (error2) {
            console.error('Error fetching iota_pmo_tasks:', error2);
            return;
        }
        
        processTasks(tasks2, 'iota_pmo_tasks');
    } else {
        processTasks(tasks, 'iota_seoul_pmo_tasks');
    }
}

async function processTasks(tasks, tableName) {
    console.log(`Found ${tasks.length} tasks in ${tableName}.`);
    let updatedCount = 0;
    
    for (const task of tasks) {
        if (!task.due_date) continue;
        if (task.due_date.trim() === '') continue;
        
        const currentDate = new Date(task.due_date);
        if (isNaN(currentDate.getTime())) continue;

        currentDate.setDate(currentDate.getDate() + 7);
        const newDateStr = currentDate.toISOString().split('T')[0];
        
        console.log(`Updating Task ID ${task.id}: ${task.due_date} -> ${newDateStr}`);
        
        const { error: updateError } = await supabase
            .from(tableName)
            .update({ due_date: newDateStr })
            .eq('id', task.id);
            
        if (updateError) {
            console.error(`Failed to update ${task.id}:`, updateError);
        } else {
            updatedCount++;
        }
    }
    
    console.log(`Successfully delayed ${updatedCount} tasks by 7 days.`);
}

run();
