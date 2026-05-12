import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qgrszltduzblpvpqvkqr.supabase.co';
const supabaseKey = 'sb_publishable_4xfLdHDF2yMobyRQruJV4A_Q4Fn9m9S';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const { data } = await supabase.from('iota_capital_stack').select('*').eq('vehicle_name', '421');
    
    let sumNew = 0;
    let sumOld = 0;
    
    data.forEach(item => {
        if (item.phase === 'new') sumNew += item.amount_krw_100m;
        if (item.phase === '2024.10.ver') sumOld += item.amount_krw_100m;
    });
    
    console.log("DB Sum 'new' (100m KRW):", sumNew);
    console.log("DB Sum '2024.10.ver' (100m KRW):", sumOld);
    
    // breakdown by tranche for 'new'
    let tNew = {};
    data.filter(d => d.phase === 'new').forEach(d => {
        tNew[d.tranche_name] = (tNew[d.tranche_name] || 0) + d.amount_krw_100m;
    });
    console.log("DB Tranches 'new':", tNew);
    
    // breakdown by tranche for 'old'
    let tOld = {};
    data.filter(d => d.phase === '2024.10.ver').forEach(d => {
        tOld[d.tranche_name] = (tOld[d.tranche_name] || 0) + d.amount_krw_100m;
    });
    console.log("DB Tranches 'old':", tOld);
}

checkData();
