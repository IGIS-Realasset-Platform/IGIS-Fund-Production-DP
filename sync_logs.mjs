const tlUrl = "https://qvegpozwrcmspdvjokiz.supabase.co/rest/v1";
const tlKey = "sb_publishable_Eb3TAC7BPbFrv8Odwwjc1g_Vv81Nf4P";
const myUrl = "https://qgrszltduzblpvpqvkqr.supabase.co/rest/v1";
const myKey = "sb_publishable_Gga5k7gjfXye0OaEXWpefw_RsCNWEmw";

async function sync() {
    console.log("Fetching logs from Team Leader DB...");
    const res = await fetch(`${tlUrl}/iota_seoul_logs?select=*`, {
        headers: { apikey: tlKey, Authorization: `Bearer ${tlKey}` }
    });
    const logs = await res.json();
    console.log(`Fetched ${logs.length} logs`);

    const resLinks = await fetch(`${tlUrl}/iota_seoul_log_links?select=*`, {
        headers: { apikey: tlKey, Authorization: `Bearer ${tlKey}` }
    });
    const links = await resLinks.json();

    const resSh = await fetch(`${tlUrl}/iota_seoul_log_stakeholders?select=*`, {
        headers: { apikey: tlKey, Authorization: `Bearer ${tlKey}` }
    });
    const sh = await resSh.json();

    console.log("Inserting into User DB...");
    const p1 = await fetch(`${myUrl}/iota_seoul_logs`, {
        method: 'POST',
        headers: { apikey: myKey, Authorization: `Bearer ${myKey}`, 'Content-Type': 'application/json', 'Prefer': 'resolution=ignore-duplicates' },
        body: JSON.stringify(logs)
    });
    console.log('logs inserted', p1.status, await p1.text());

    if (links.length > 0) {
        const p2 = await fetch(`${myUrl}/iota_seoul_log_links`, {
            method: 'POST',
            headers: { apikey: myKey, Authorization: `Bearer ${myKey}`, 'Content-Type': 'application/json', 'Prefer': 'resolution=ignore-duplicates' },
            body: JSON.stringify(links)
        });
        console.log('links inserted', p2.status, await p2.text());
    }

    if (sh.length > 0) {
        const p3 = await fetch(`${myUrl}/iota_seoul_log_stakeholders`, {
            method: 'POST',
            headers: { apikey: myKey, Authorization: `Bearer ${myKey}`, 'Content-Type': 'application/json', 'Prefer': 'resolution=ignore-duplicates' },
            body: JSON.stringify(sh)
        });
        console.log('stakeholders inserted', p3.status, await p3.text());
    }
}
sync();
