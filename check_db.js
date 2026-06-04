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
  console.log("=== CHECK ALL NOTIFICATIONS ===");
  const { data: notifications, error: notiError } = await supabase
    .from('iota_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30);
  
  if (notiError) console.error("Noti Error:", notiError);
  else {
    notifications.forEach(n => {
      console.log(`ID: ${n.id} | Title: ${n.title} | Type: ${n.type} | RefID: ${n.reference_id} | Created: ${n.created_at}`);
    });
  }
}

check();
