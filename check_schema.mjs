const supabaseUrl = "https://qgrszltduzblpvpqvkqr.supabase.co";
const supabaseKey = "sb_publishable_4xfLdHDF2yMobyRQruJV4A_Q4Fn9m9S";

const headers = {
    "apikey": supabaseKey,
    "Authorization": `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
};

async function get() {
    const res = await fetch(`${supabaseUrl}/rest/v1/iota_capital_stack?limit=1`, { headers });
    const data = await res.json();
    console.log(data);
}
get();
