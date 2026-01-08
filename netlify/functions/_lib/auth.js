import { sbAnon, sbService } from "./supabase.js";
import { unauth, forbid } from "./http.js";

export function getBearerToken(event) {
  const h = event.headers?.authorization || event.headers?.Authorization || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

// Returns { user, profile, token }
export async function requireAuth(event) {
  const token = getBearerToken(event);
  if (!token) return { error: unauth("Missing token") };

  const sba = sbAnon(token);
  const { data: u, error: uerr } = await sba.auth.getUser();
  if (uerr || !u?.user) return { error: unauth("Invalid token") };

  // IMPORTANT: profiles uses user_id
  const { data: profile, error: perr } = await sba
    .from("profiles")
    .select("*")
    .eq("user_id", u.user.id)
    .single();

  if (perr || !profile) return { error: unauth("Profile not found") };
  return { token, user: u.user, profile };
}

export async function requireAdmin(event) {
  const auth = await requireAuth(event);
  if (auth.error) return auth;
  if (auth.profile.role !== "admin") return { error: forbid("Admin only") };
  return auth;
}

// Helper when you need to create/find profile by auth user id using service key
export async function getProfileByUserIdService(user_id) {
  const sbs = sbService();
  const { data, error } = await sbs.from("profiles").select("*").eq("user_id", user_id).single();
  if (error) throw new Error(error.message);
  return data;
}
