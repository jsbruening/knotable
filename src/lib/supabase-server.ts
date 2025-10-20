import { createClient } from '@supabase/supabase-js'
import { env } from '~/env.js'

// Server-side Supabase client (for API routes and server-side operations)
export const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

