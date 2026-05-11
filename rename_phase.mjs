const supabaseUrl = "https://qgrszltduzblpvpqvkqr.supabase.co";
const supabaseKey = "sb_publishable_4xfLdHDF2yMobyRQruJV4A_Q4Fn9m9S";

const headers = {
    "apikey": supabaseKey,
    "Authorization": `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
};

async function update() {
    const res = await fetch(`${supabaseUrl}/rest/v1/iota_capital_stack?vehicle_name=eq.421&phase=eq.Current`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ phase: "2024.10.ver" })
    });
    console.log("Status:", res.status);
}
update();
