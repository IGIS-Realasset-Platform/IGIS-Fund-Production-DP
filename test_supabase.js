import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Read env variables from .env if possible or extract from code
const content = fs.readFileSync('src/utils/supabaseClient.js', 'utf8')
const urlMatch = content.match(/VITE_SUPABASE_URL\s*\}?\s*=\s*import\.meta\.env\s*\|\|\s*\{[^}]*VITE_SUPABASE_URL:\s*'([^']+)'/) 
              || content.match(/const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;/)
// We can't easily extract env vars without running the build or having .env
// Let's just find the .env file
