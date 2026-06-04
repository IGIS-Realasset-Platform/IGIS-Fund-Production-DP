import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('/Users/jkjeon2025/Documents/GitHub/IGIS Fund Production DP/.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("=== LATEST TASKS FROM iota_ipr_tasks ===");
  const { data: iprTasks, error: iprError } = await supabase
    .from('iota_ipr_tasks')
    .select('id, task_name, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (iprError) console.error("IPR Tasks Error:", iprError);
  else console.log(iprTasks);

  console.log("\n=== LATEST NOTIFICATIONS FROM iota_notifications ===");
  const { data: notifications, error: notiError } = await supabase
    .from('iota_notifications')
    .select('id, title, type, reference_id, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (notiError) console.error("Noti Error:", notiError);
  else console.log(notifications);
}

check();
