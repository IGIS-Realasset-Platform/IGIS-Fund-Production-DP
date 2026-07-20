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
  console.log("Searching for '시스템 스케줄러' logs in public.iota_seoul_logs...");
  const { data: logs, error: fetchErr } = await supabase
    .from('iota_seoul_logs')
    .select('log_id, writer_name, raw_text, created_at')
    .eq('writer_name', '시스템 스케줄러');

  if (fetchErr) {
    console.error("Error fetching logs:", fetchErr);
    return;
  }

  console.log(`Found ${logs.length} logs written by '시스템 스케줄러'.`);
  if (logs.length > 0) {
    console.log("Sample logs:", JSON.stringify(logs, null, 2));
    
    const { data: deleted, error: deleteErr } = await supabase
      .from('iota_seoul_logs')
      .delete()
      .eq('writer_name', '시스템 스케줄러')
      .select('*');

    if (deleteErr) {
      console.error("Error deleting logs:", deleteErr);
    } else {
      console.log(`Successfully deleted ${deleted.length} logs from DB.`);
    }
  } else {
    console.log("No logs to delete.");
  }
}

run();
