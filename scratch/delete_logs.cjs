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
    console.log('Fetching recent auto-heal logs to delete...');
    
    // Calculate a timestamp for 1 hour ago
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    const { data: logs, error } = await supabase
        .from('iota_seoul_logs')
        .select('log_id')
        .eq('writer_staff_id', 'system_auto')
        .gte('created_at', oneHourAgo.toISOString());
        
    if (error) {
        console.error('Error fetching logs:', error);
        return;
    }
    
    console.log(`Found ${logs.length} auto-heal logs to delete.`);
    
    if (logs.length > 0) {
        const logIds = logs.map(l => l.log_id);
        
        // Delete from links first just in case there's no CASCADE
        const { error: linkErr } = await supabase
            .from('iota_seoul_log_links')
            .delete()
            .in('log_id', logIds);
            
        if (linkErr) console.error('Error deleting links:', linkErr);
        
        // Delete logs
        const { error: delErr } = await supabase
            .from('iota_seoul_logs')
            .delete()
            .in('log_id', logIds);
            
        if (delErr) {
            console.error('Error deleting logs:', delErr);
        } else {
            console.log(`Successfully deleted ${logs.length} system_auto logs.`);
        }
    }
}

run();
