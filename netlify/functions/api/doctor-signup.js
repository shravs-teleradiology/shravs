import { ok, bad, methodNotAllowed, parseBody } from "./_lib/http.js";
import { sbService } from "./_lib/supabase.js";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return ok({});
  if (event.httpMethod !== "POST") return methodNotAllowed();

  const body = parseBody(event);
  const name = (body.name || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  const organization = (body.organization || "").trim();

  if (!name || !email || !password || !organization) return bad("Missing fields");

  const sbs = sbService();

  // 1) Create auth user
  const { data: created, error: cerr } = await sbs.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role: "doctor", organization }
  });

  if (cerr) return { statusCode: 500, body: JSON.stringify({ error: cerr.message }) };
  const user_id = created.user.id;

  // 2) Create profile (approved=false until admin accepts)
  const { data: profile, error: perr } = await sbs
    .from("profiles")
    .insert({
      user_id,
      name,
      email,
      organization,
      role: "doctor",
      approved: false
    })
    .select("*")
    .single();

  if (perr) return { statusCode: 500, body: JSON.stringify({ error: perr.message }) };

  // 3) Create doctor request row
  const { error: rerr } = await sbs
    .from("doctor_requests")
    .insert({
      profile_id: profile.id,
      name,
      email,
      organization,
      status: "pending"
    });

  if (rerr) return { statusCode: 500, body: JSON.stringify({ error: rerr.message }) };

  return ok({ message: "Signup created. Waiting for admin approval.", profile_id: profile.id });
};
