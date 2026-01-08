const { createClient } = require("@supabase/supabase-js");

function getEnv() {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon) throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
  return { url, anon, service };
}

function supabaseUser(token) {
  const { url, anon } = getEnv();
  return createClient(url, anon, {
    global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function supabaseAdmin() {
  const { url, service } = getEnv();
  if (!service) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

module.exports = { supabaseUser, supabaseAdmin };
