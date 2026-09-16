// POST /api/subscribe — adds a waitlist sign-up to Brevo.
//
// The page never talks to Brevo directly: the API key stays server-side.
// Env: BREVO_API_KEY, BREVO_LIST_ID (set in Vercel → Settings → Environment Variables).

const BREVO_URL = "https://api.brevo.com/v3/contacts";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const UTM_FIELDS = {
  utm_source: "UTM_SOURCE",
  utm_medium: "UTM_MEDIUM",
  utm_campaign: "UTM_CAMPAIGN",
};

function send(res, status, body) {
  res.setHeader("Cache-Control", "no-store");
  res.status(status).json(body);
}

function clean(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return send(res, 405, { ok: false, error: "method_not_allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  if (!body || typeof body !== "object") {
    return send(res, 400, { ok: false, error: "bad_request" });
  }

  // Honeypot: real people never see this field. Pretend it worked so bots move on.
  if (clean(body.website, 200)) {
    return send(res, 200, { ok: true });
  }

  const email = clean(body.email, 254).toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return send(res, 400, { ok: false, error: "invalid_email" });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_LIST_ID);
  if (!apiKey || !Number.isInteger(listId) || listId <= 0) {
    console.error("subscribe: BREVO_API_KEY or BREVO_LIST_ID is missing or invalid");
    return send(res, 500, { ok: false, error: "server_config" });
  }

  const attributes = {};
  // Only send UTMs that are present. With updateEnabled, an empty value would
  // wipe the source recorded when this person first signed up.
  for (const [param, attribute] of Object.entries(UTM_FIELDS)) {
    const value = clean(body[param], 200);
    if (value) attributes[attribute] = value;
  }

  let response;
  try {
    response = await fetch(BREVO_URL, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        email,
        attributes,
        listIds: [listId],
        updateEnabled: true,
      }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    console.error("subscribe: Brevo request failed", err && err.name);
    return send(res, 502, { ok: false, error: "upstream_unreachable" });
  }

  // 201 = created, 204 = existing contact updated.
  if (response.ok) {
    return send(res, 200, { ok: true });
  }

  let detail = {};
  try { detail = await response.json(); } catch { /* empty or non-JSON body */ }

  // Already on the list counts as success — the person is signed up either way.
  if (detail.code === "duplicate_parameter" || /already exist/i.test(detail.message || "")) {
    return send(res, 200, { ok: true });
  }

  console.error("subscribe: Brevo rejected contact", response.status, detail.code, detail.message);

  if (response.status === 400 && /email/i.test(detail.message || "")) {
    return send(res, 400, { ok: false, error: "invalid_email" });
  }
  return send(res, 502, { ok: false, error: "upstream_error" });
};
