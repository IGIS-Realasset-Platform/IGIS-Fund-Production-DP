import { createClient } from '@supabase/supabase-js';
const supabaseUrl = "https://qgrszltduzblpvpqvkqr.supabase.co";
const supabaseKey = "sb_publishable_4xfLdHDF2yMobyRQruJV4A_Q4Fn9m9S";
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase.from('iota_seoul_pilot_members').select('*');
  if (data) {
    const vips = data.filter(d => ['이시정', '이관용', '전기영'].includes(d.staff_name));
    console.log('VIPs:', vips);
  } else {
    console.log(error);
  }
}
checkSchema();
