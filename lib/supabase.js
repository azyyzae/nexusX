import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

let supabase

export function getSupabase() {
  if (!supabaseUrl || !supabaseKey) return null
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseKey)
  }
  return supabase
}
