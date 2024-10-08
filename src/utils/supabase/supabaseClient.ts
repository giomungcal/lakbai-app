import { createClient } from "@supabase/supabase-js";

// Create a custom supabase client that injects the Clerk Supabase token into the request headers
export const supabaseClient = async (supabaseToken) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${supabaseToken}` } },
    }
  );
  return supabase;
};
