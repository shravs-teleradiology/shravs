import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const ANON = process.env.SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function sbAnon(token = null) {
  return createClient(SUPABASE_URL, ANON, {
    global: token ? { headers: { Authorization: `Bearer ${token}` } } : {},
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function sbService() {
  return createClient(SUPABASE_URL, SERVICE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
