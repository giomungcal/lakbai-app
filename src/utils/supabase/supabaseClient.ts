import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../../database.types";

let cachedSupabaseClient: SupabaseClient | null = null;
let lastToken: string | null = null;

// Create a custom supabase client that injects the Clerk Supabase token into the request headers
export const supabaseClient = async (supabaseToken?: string | null) => {
  if (supabaseToken === lastToken && cachedSupabaseClient !== null) {
    return cachedSupabaseClient;
  }

  let headers = {};

  if (supabaseToken) {
    lastToken = supabaseToken;
    headers = { Authorization: `Bearer ${supabaseToken}` };
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers },
    }
  );

  cachedSupabaseClient = supabase;

  return supabase;
};
