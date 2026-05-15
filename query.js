import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)
async function run() {
  const { data } = await supabase.from('iota_building_specs').select('*').eq('vehicle_name', '427')
  console.log(JSON.stringify(data, null, 2))
}
run()
