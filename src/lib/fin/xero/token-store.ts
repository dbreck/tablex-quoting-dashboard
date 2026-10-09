/**
 * Service-role access to the single-row `fin_xero_tokens` table (RLS on, no policies).
 *
 * Rotation safety: Xero refresh tokens are SINGLE-USE and expire after 60 days without
 * use. Every refresh is persisted BEFORE the new access token is used (persist-first),
 * so a crash between refresh and use never orphans the rotation chain. If a refresh
 * comes back `invalid_grant`, the grant is dead: re-run scripts/fin/xero-connect.ts.
 *
 * Callers pass their own Supabase client (service role) so scripts stay in control of
 * env loading. Token values are never logged.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  refreshAccessToken,
  XeroTokenError,
  type XeroAuth,
  type XeroTokenSet,
} from "./client";

/** Refresh proactively when the access token has less than this left. */
const REFRESH_SKEW_MS = 2 * 60 * 1000;

export interface FinXeroTokens {
  tenant_id: string;
  tenant_name: string | null;
  access_token: string;
  refresh_token: string;
  access_token_expires_at: string;
  last_modified_since: string | null;
  connected_at: string;
  updated_at: string;
}

const COLUMNS =
  "tenant_id, tenant_name, access_token, refresh_token, access_token_expires_at, " +
  "last_modified_since, connected_at, updated_at";

export async function loadTokens(sb: SupabaseClient): Promise<FinXeroTokens | null> {
  const { data, error } = await sb
    .from("fin_xero_tokens")
    .select(COLUMNS)
    .eq("id", true)
    .maybeSingle<FinXeroTokens>();
  if (error) throw new Error(`Failed to read fin_xero_tokens: ${error.message}`);
  return data;
}

/**
 * Store a fresh connection (id=true upsert — reconnecting replaces the row).
 * The If-Modified-Since watermark survives a reconnect to the SAME tenant and is
 * cleared when the tenant changes.
 */
export async function saveConnection(
  sb: SupabaseClient,
  args: { tenantId: string; tenantName: string | null; tokens: XeroTokenSet },
): Promise<void> {
  const existing = await loadTokens(sb);
  const now = new Date();
  const { error } = await sb.from("fin_xero_tokens").upsert(
    {
      id: true,
      tenant_id: args.tenantId,
      tenant_name: args.tenantName,
      access_token: args.tokens.access_token,
      refresh_token: args.tokens.refresh_token,
      access_token_expires_at: expiresAtIso(args.tokens, now),
      last_modified_since:
        existing && existing.tenant_id === args.tenantId ? existing.last_modified_since : null,
      connected_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    { onConflict: "id" },
  );
  if (error) throw new Error(`Failed to save fin_xero_tokens: ${error.message}`);
}

/** Persist a rotated token set. Throws — never run on with an unpersisted refresh token. */
export async function persistRotatedTokens(sb: SupabaseClient, tokens: XeroTokenSet): Promise<void> {
  const now = new Date();
  const { error } = await sb
    .from("fin_xero_tokens")
    .update({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      access_token_expires_at: expiresAtIso(tokens, now),
      updated_at: now.toISOString(),
    })
    .eq("id", true);
  if (error) throw new Error(`Failed to persist rotated Xero tokens: ${error.message}`);
}

/** Advance the invoice If-Modified-Since watermark. */
export async function setWatermark(sb: SupabaseClient, iso: string): Promise<void> {
  const { error } = await sb
    .from("fin_xero_tokens")
    .update({ last_modified_since: iso, updated_at: new Date().toISOString() })
    .eq("id", true);
  if (error) throw new Error(`Failed to set the Xero watermark: ${error.message}`);
}

/**
 * Ready-to-use auth for a run: loads the row, refreshes proactively when the access
 * token is near expiry (persist-first), and wires a 401 refresher that does the same.
 * Throws a readable error when not connected or when the grant is dead.
 */
export async function getAuthorizedSession(
  sb: SupabaseClient,
): Promise<{ auth: XeroAuth; tokens: FinXeroTokens }> {
  const tokens = await loadTokens(sb);
  if (!tokens) {
    throw new Error("Xero is not connected. Run: npx tsx scripts/fin/xero-connect.ts");
  }

  // The refresher reads the CURRENT refresh token from this closure and rotates it.
  let currentRefresh = tokens.refresh_token;
  const refresh = async (): Promise<string> => {
    let next: XeroTokenSet;
    try {
      next = await refreshAccessToken(currentRefresh);
    } catch (err) {
      if (err instanceof XeroTokenError && err.code === "invalid_grant") {
        throw new Error(
          "Xero refresh token is dead (revoked, already used, or idle > 60 days). " +
            "Reconnect: npx tsx scripts/fin/xero-connect.ts",
        );
      }
      throw err;
    }
    await persistRotatedTokens(sb, next); // persist FIRST
    currentRefresh = next.refresh_token;
    return next.access_token;
  };

  const auth: XeroAuth = { token: tokens.access_token, tenantId: tokens.tenant_id, refresh };
  const expiresAt = new Date(tokens.access_token_expires_at).getTime();
  if (!Number.isFinite(expiresAt) || expiresAt - Date.now() < REFRESH_SKEW_MS) {
    auth.token = await refresh();
  }
  return { auth, tokens };
}

function expiresAtIso(tokens: XeroTokenSet, issuedAt: Date): string {
  return new Date(issuedAt.getTime() + tokens.expires_in * 1000).toISOString();
}
