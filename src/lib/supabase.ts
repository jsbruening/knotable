import { createClient } from "@supabase/supabase-js";

// Client-side Supabase client (for browser)
// Create client lazily to avoid issues during build time
let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
}

// Export a proxy object that creates the client only when accessed
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    const client = getSupabaseClient();
    return client[prop as keyof typeof client];
  }
});
