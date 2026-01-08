export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
};

export function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", ...corsHeaders },
    body: JSON.stringify(body),
  };
}

export function ok(body) { return json(200, body); }
export function bad(msg) { return json(400, { error: msg }); }
export function unauth(msg="Unauthorized") { return json(401, { error: msg }); }
export function forbid(msg="Forbidden") { return json(403, { error: msg }); }
export function methodNotAllowed() { return json(405, { error: "Method not allowed" }); }

export function parseBody(event) {
  try { return event.body ? JSON.parse(event.body) : {}; }
  catch { return {}; }
}
