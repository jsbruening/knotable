import { createClient } from "@supabase/supabase-js";
import { env } from "~/env.js";

// Server-side Supabase client (for API routes and server-side operations)
// Create client lazily to avoid issues during build time
let supabaseAdminClient: ReturnType<typeof createClient> | null = null;

function getSupabaseAdminClient() {
  if (!supabaseAdminClient) {
    try {
      supabaseAdminClient = createClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        },
      );
    } catch (error) {
      // During build time, return a mock client to avoid errors
      if (typeof window === "undefined" && process.env.NODE_ENV === "production") {
        return {} as any;
      }
      throw error;
    }
  }
  return supabaseAdminClient;
}

// Export a proxy object that creates the client only when accessed
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    const client = getSupabaseAdminClient();
    return client[prop as keyof typeof client];
  }
});

