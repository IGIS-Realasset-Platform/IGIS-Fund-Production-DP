import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env manually
const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val) env[key.trim()] = val.join('=').trim().replace(/['"]/g, '');
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const workspaces = [
    { id: 'marketing', table: 'iota_marketing_tasks' },
    { id: 'digital', table: 'iota_digital_tasks' },
    { id: 'fund', table: 'iota_fund_tasks' },
    { id: 'development', table: 'iota_development_tasks' },
    { id: 'financing', table: 'iota_financing_tasks' },
    { id: 'ipr', table: 'iota_ipr_tasks' },
    { id: 'pm', table: 'iota_pm_tasks' }
];

const getCurrentWeekInfo = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    
    const firstDay = new Date(year, month - 1, 1);
    let firstDayWeekday = firstDay.getDay();
    if (firstDayWeekday === 0) firstDayWeekday = 7;
    
    const offsetDate = date + firstDayWeekday - 1;
    const week = Math.ceil(offsetDate / 7);
    
    return { weekLabel: `${year.toString().slice(2)}년 ${month}월 ${week}주`, year, month, week };
};

async function run() {
    const { weekLabel, year, month, week } = getCurrentWeekInfo();
    
    for (const ws of workspaces) {
        console.log(`Syncing ${ws.id}...`);
        const { data: tasks, error } = await supabase.from(ws.table).select('*').order('created_at', { ascending: false });
        if (error || !tasks || tasks.length === 0) {
            console.log(`No tasks for ${ws.id} (error: ${error?.message})`);
            continue;
        }
        
        const weekId = `${ws.id}-${year}-${month}-${week}`;
        
        const { data: existing } = await supabase
            .from('iota_weekly_snapshots')
            .select('id')
            .eq('workspace', ws.id)
            .eq('week_label', weekLabel)
            .single();
            
        if (existing) {
            await supabase
                .from('iota_weekly_snapshots')
                .update({ snapshot_data: tasks, created_at: new Date().toISOString() })
                .eq('id', existing.id);
        } else {
            await supabase
                .from('iota_weekly_snapshots')
                .insert([{
                    id: weekId,
                    workspace: ws.id,
                    week_label: weekLabel,
                    snapshot_data: tasks,
                    created_at: new Date().toISOString()
                }]);
        }
        console.log(`Synced ${ws.id} successfully! Count: ${tasks.length}`);
    }
}

run();
