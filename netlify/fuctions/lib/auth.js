const { supabaseUser } = require("./supabase");

function getBearerToken(event) {
  const h = event.headers || {};
  const auth = h.authorization || h.Authorization || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

async function requireUser(event) {
  const token = getBearerToken(event);
  if (!token) return { error: "No token" };

  const sb = supabaseUser(token);
  const { data, error } = await sb.auth.getUser();
  if (error || !data?.user) return { error: "Invalid token" };

  // Load profile (RLS allows self; admin can read all)
  const { data: profile, error: pErr } = await sb
    .from("profiles")
    .select("id,email,name,role,organization")
    .eq("id", data.user.id)
    .single();

  if (pErr || !profile) return { error: "Profile not found" };

  return { token, sb, user: data.user, profile };
}

function requireAdmin(profile) {
  return profile && profile.role === "admin";
}

module.exports = { requireUser, requireAdmin };
