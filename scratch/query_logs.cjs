const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: '/Users/jkjeon2025/Documents/GitHub/IGIS Fund Production DP/.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    const { data, error } = await supabase
        .from('iota_seoul_logs')
        .select('raw_text, work_date, created_at, metadata')
        .order('created_at', { ascending: false })
        .limit(30);
        
    if (error) {
        console.error(error);
        return;
    }
    console.log("Recent logs:");
    data.forEach(d => {
        if (d.raw_text.includes('회의 상정 등급이') || d.raw_text.includes('병목')) {
            console.log('---');
            console.log(d.raw_text);
        }
    });
}
check();
