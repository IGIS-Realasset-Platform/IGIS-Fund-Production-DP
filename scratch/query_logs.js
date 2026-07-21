import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/jkjeon2025/Documents/GitHub/IGIS Fund Production DP/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase
        .from('iota_seoul_logs')
        .select('raw_text')
        .order('created_at', { ascending: false })
        .limit(150);
        
    if (error) {
        console.error(error);
        return;
    }
    
    console.log("Recent logs containing '병목':");
    const blockerLogs = data.filter(d => d.raw_text && (d.raw_text.includes('병목') || d.raw_text.includes('상정 등급')));
    blockerLogs.slice(0, 10).forEach(d => {
        console.log('---');
        console.log(d.raw_text);
    });
}
check();
