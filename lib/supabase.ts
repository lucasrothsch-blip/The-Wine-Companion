import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anon) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const supabaseClient = createClient(url, anon);

export const getServiceClient = () => {
  if (!serviceRole) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY for server routes");
  }

  return createClient(url, serviceRole, {
    auth: {
      persistSession: false
    }
  });
};
