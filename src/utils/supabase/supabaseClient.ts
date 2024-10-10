import { createClient } from "@supabase/supabase-js";
import { Database } from "../../../database.types";

// Create a custom supabase client that injects the Clerk Supabase token into the request headers
export const supabaseClient = async (supabaseToken?: string) => {
  let headers = {};

  if (supabaseToken) {
    headers = { Authorization: `Bearer ${supabaseToken}` };
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: headers },
    }
  );
  return supabase;
};
