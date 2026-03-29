import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Admin client - bypasses RLS (for backend operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Create a client scoped to a specific user's JWT
export function createUserClient(accessToken: string) {
  return createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY || supabaseServiceKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  })
}
