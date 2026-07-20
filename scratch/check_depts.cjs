const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('/Users/jkjeon2025/Documents/GitHub/IGIS Fund Production DP/.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Signing in...");
  await supabase.auth.signInWithPassword({
    email: 'jk.jeon@igisam.com',
    password: 'jeonkiy9120'
  });

  const { data: depts, error } = await supabase
    .schema('iota_v2')
    .from('iota_departments')
    .select('*');

  if (error) {
    console.error("Fetch depts failed:", error);
    return;
  }
  console.log("Departments in DB:", depts);

  const { data: tasks, error: taskErr } = await supabase
    .schema('iota_v2')
    .from('iota_pmo_tasks')
    .select('id, task_name, lead_dept_code, lead_dept:iota_departments!lead_dept_code(dept_name)')
    .limit(10);

  if (taskErr) {
    console.error("Fetch tasks failed:", taskErr);
    return;
  }
  console.log("Sample tasks lead_dept join:", JSON.stringify(tasks, null, 2));
}

run();
