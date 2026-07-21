const url = 'https://qgrszltduzblpvpqvkqr.supabase.co/rest/v1/iota_pmo_tasks?select=*&limit=1';
const key = 'sb_publishable_4xfLdHDF2yMobyRQruJV4A_Q4Fn9m9S';

async function run() {
    const res = await fetch(url, {
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Accept-Profile': 'iota_v2'
        }
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}
run();
