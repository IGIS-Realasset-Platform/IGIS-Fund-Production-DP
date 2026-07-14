const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qgrszltduzblpvpqvkqr.supabase.co';
const supabaseKey = 'sb_publishable_4xfLdHDF2yMobyRQruJV4A_Q4Fn9m9S';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkNotifications() {
    const { data: notifications, error } = await supabase
        .from('iota_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching notifications:', error);
        return;
    }

    console.log('--- RECENT NOTIFICATIONS ---');
    for (const notif of notifications) {
        console.log(`ID: ${notif.id || notif.notification_id}`);
        console.log(`Title: ${notif.title}`);
        console.log(`Body: ${notif.body}`);
        console.log(`Reference ID: ${notif.reference_id}`);
        console.log(`Created At: ${notif.created_at}`);
        console.log('-------------------');
    }
}

checkNotifications();
