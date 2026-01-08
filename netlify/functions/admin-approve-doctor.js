export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { doctor_id } = req.body;
  if (!doctor_id) return res.status(400).json({ error: "Missing doctor_id" });

  const { data: reqData, error: reqErr } = await sb.from("doctor_requests")
    .select("name, email, organization")
    .eq("id", doctor_id)
    .single();

  if (reqErr || !reqData) return res.status(404).json({ error: "Doctor request not found" });

  // Create auth user + profile (service_role bypasses RLS)
  const { data: authData, error: authErr } = await sb.auth.admin.createUser({
    email: reqData.email,
    password: "temp" + Math.random().toString(36).slice(-8), // Temp password
    email_confirm: true,
    user_metadata: { name: reqData.name, role: "doctor" }
  });

  if (authErr) return res.status(500).json({ error: authErr.message });

  // Update profile
  const { error: profileErr }
