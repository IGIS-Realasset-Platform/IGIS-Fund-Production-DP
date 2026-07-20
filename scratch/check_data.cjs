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
  const { data: tasks, error } = await supabase
    .schema('iota_v2')
    .from('iota_pmo_tasks')
    .select('id, project_code, task_name, lead_dept_code, lead_dept:iota_departments!lead_dept_code(dept_name), assignee, is_blocker, needs_decision, due_date, status, meeting_grade')
    .limit(10);

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("PMO Tasks (sample):", tasks.length);
    console.log(JSON.stringify(tasks, null, 2));
  }
}

run();
