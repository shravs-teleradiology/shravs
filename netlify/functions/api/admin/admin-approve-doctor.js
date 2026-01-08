import { ok, bad, methodNotAllowed, parseBody } from "./_lib/http.js";
import { requireAdmin } from "./_lib/auth.js";
import { sbAnon } from "./_lib/supabase.js";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return ok({});
  if (event.httpMethod !== "POST") return methodNotAllowed();

  const auth = await requireAdmin(event);
  if (auth.error) return auth.error;

  const body = parseBody(event);
  const doctor_request_id = body.doctor_request_id;
  if (!doctor_request_id) return bad("Missing doctor_request_id");

  const sba = sbAnon(auth.token);

  // 1) Load request
  const { data: reqRow, error: reqErr } = await sba
    .from("doctor_requests")
    .select("id,profile_id,status")
    .eq("id", doctor_request_id)
    .single();

  if (reqErr || !reqRow) return { statusCode: 404, body: JSON.stringify({ error: "Request not found" }) };
  if (reqRow.status !== "pending") return bad("Request is not pending");

  // 2) Approve profile
  const { data: prof, error: pErr } = await sba
    .from("profiles")
    .update({ approved: true, updated_at: new Date().toISOString() })
    .eq("id", reqRow.profile_id)
    .select("id,user_id,name,email,role,approved")
    .single();

  if (pErr) return { statusCode: 500, body: JSON.stringify({ error: pErr.message }) };

  // 3) Mark request approved (store who approved using admin's internal profile.id)
  const { error: uErr } = await sba
    .from("doctor_requests")
    .update({
      status: "approved",
      approved_by_profile_id: auth.profile.id,
      approved_at: new Date().toISOString()
    })
    .eq("id", reqRow.id);

  if (uErr) return { statusCode: 500, body: JSON.stringify({ error: uErr.message }) };

  return ok({ message: "Doctor approved", doctor_profile: prof });
};
