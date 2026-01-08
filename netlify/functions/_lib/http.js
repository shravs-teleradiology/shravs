function corsHeaders() {
  const origin = process.env.CORS_ORIGIN || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
  };
}

function json(statusCode, data) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
    body: JSON.stringify(data),
  };
}

function ok(data) { return json(200, data); }
function badRequest(message) { return json(400, { error: message }); }
function unauthorized(message = "Unauthorized") { return json(401, { error: message }); }
function forbidden(message = "Forbidden") { return json(403, { error: message }); }

function parseJsonBody(event) {
  if (!event.body) return {};
  try { return JSON.parse(event.body); }
  catch { return null; }
}

function isOptions(event) {
  return event.httpMethod === "OPTIONS";
}

function optionsOk() {
  return { statusCode: 200, headers: corsHeaders(), body: "" };
}

module.exports = {
  ok, json, badRequest, unauthorized, forbidden,
  parseJsonBody, isOptions, optionsOk,
};
