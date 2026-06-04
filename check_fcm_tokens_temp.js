import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('./.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function testNotificationTypes() {
  const testUserId = '9ba52276-9705-4230-a12d-984f999833f4'; // 전기영
  
  // Test Log Type
  console.log('--- Testing insert with type: "log" ---');
  const { error: logError } = await supabase
    .from('iota_notifications')
    .insert([{
      user_id: testUserId,
      title: 'Test Log Notification',
      body: 'Body text',
      type: 'log',
      is_read: false,
      created_at: new Date().toISOString()
    }]);

  if (logError) {
    console.log(`Log Insert Result: Code: ${logError.code}, Message: ${logError.message}`);
  } else {
    console.log('Log Insert Result: SUCCESS');
  }

  // Test Task Type
  console.log('--- Testing insert with type: "task" ---');
  const { error: taskError } = await supabase
    .from('iota_notifications')
    .insert([{
      user_id: testUserId,
      title: 'Test Task Notification',
      body: 'Body text',
      type: 'task',
      is_read: false,
      created_at: new Date().toISOString()
    }]);

  if (taskError) {
    console.log(`Task Insert Result: Code: ${taskError.code}, Message: ${taskError.message}`);
  } else {
    console.log('Task Insert Result: SUCCESS');
  }
}

testNotificationTypes();
