import { createHmac, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

/**
 * Mints a fresh ClearPH Feedback "WP-bridge" identity token so an external
 * reviewer (e.g. Brian) can leave annotated feedback on a public design comp
 * WITHOUT logging in.
 *
 * The feedback embed loader normally gets this token from the WordPress
 * plugin, which HMAC-signs it with the site's api_secret. Our comps are
 * static HTML served from this dashboard (not WordPress), so we replicate the
 * plugin's `build_token()` here and inline the result via the loader script
 * at /comps/_feedback-embed.js.
 *
 * Tokens carry a unix `ts` and are only accepted within a ±60s freshness
 * window on the feedback side, so they CANNOT be hardcoded into the static
 * file — they must be minted live, per page load. Hence this route.
 *
 * apikey is public (it ships in the embed.js URL); the api_secret stays
 * server-side in env and never leaves this handler.
 *
 * Wire format (locked, mirrors the WP plugin + src/lib/wp-bridge-token.ts in
 * the clearph-feedback repo):
 *   token = base64url(JSON.stringify({
 *     p: <RAW JSON string of payload>,
 *     s: hex(HMAC-SHA256(p_string, api_secret)),
 *   }))
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMBED_ORIGIN =
  process.env.CLEARPH_FEEDBACK_EMBED_ORIGIN ??
  "https://embed.feedback.clearph.com";

// Default reviewer identity. Feedback is attributed to this person in the
// feedback dashboard; override per-request with ?email= and ?name=.
const DEFAULT_EMAIL = "brian@tablex.com";
const DEFAULT_NAME = "Brian (TableX)";

function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function GET(req: NextRequest): NextResponse {
  const apikey = process.env.CLEARPH_FEEDBACK_APIKEY;
  const apisecret = process.env.CLEARPH_FEEDBACK_APISECRET;

  if (!apikey || !apisecret) {
    return NextResponse.json(
      { error: "feedback_not_configured" },
      { status: 503 },
    );
  }

  const url = new URL(req.url);
  const email = (url.searchParams.get("email") || DEFAULT_EMAIL).trim();
  const displayName = (url.searchParams.get("name") || DEFAULT_NAME).trim();

  const payload = {
    apikey,
    email,
    display_name: displayName,
    // Stable synthetic WP user id so repeat visits map to the same reviewer
    // (the feedback side keys provisioning on email + wp_user_id).
    wp_user_id: "tablex-comps-reviewer",
    ts: Math.floor(Date.now() / 1000),
    nonce: randomUUID(),
  };

  // Sign the RAW serialized string and ship that exact string in the
  // envelope — never re-stringify after parse (JSON.stringify isn't
  // byte-stable, which would break HMAC verification).
  const pString = JSON.stringify(payload);
  const signature = createHmac("sha256", apisecret).update(pString, "utf8").digest("hex");
  const envelope = JSON.stringify({ p: pString, s: signature });
  const token = base64url(Buffer.from(envelope, "utf8"));

  return NextResponse.json(
    { token, apikey, embedOrigin: EMBED_ORIGIN },
    { headers: { "Cache-Control": "no-store" } },
  );
}
