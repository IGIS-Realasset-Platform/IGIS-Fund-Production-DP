import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qgrszltduzblpvpqvkqr.supabase.co';
const supabaseKey = 'sb_publishable_4xfLdHDF2yMobyRQruJV4A_Q4Fn9m9S';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const { data, error } = await supabase
        .from('iota_capital_stack')
        .select('*');
        
    if (error) {
        console.error("Error fetching:", error);
        return;
    }
    
    // Group by vehicle_name
    const vehicles = {};
    data.forEach(item => {
        if (!vehicles[item.vehicle_name]) {
            vehicles[item.vehicle_name] = [];
        }
        vehicles[item.vehicle_name].push(item);
    });
    
    console.log("Found vehicles:", Object.keys(vehicles));
    console.log("Total records:", data.length);
    
    // Check 421 data
    const d421 = vehicles['421'] || [];
    console.log("421 records:", d421.length);
    
    // Group 421 by tranche
    const tranches = {};
    d421.forEach(item => {
        const t = item.tranche || item.type;
        if (!tranches[t]) tranches[t] = 0;
        tranches[t] += (item.amount || 0);
    });
    console.log("421 Tranche breakdown (amount):", tranches);
}

checkData();
