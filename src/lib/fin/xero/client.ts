/**
 * Dependency-free Xero API client for the TableX Financials warehouse (fin_* tables).
 *
 * Separate OAuth app from tablex-site's "TableX CRM Sync": this one is
 * "TableX Financials", env FIN_XERO_CLIENT_ID / FIN_XERO_CLIENT_SECRET, redirect
 * http://localhost:5555/callback (scripts/fin/xero-connect.ts runs the callback server).
 *
 * READ-ONLY by construction: `.read` scopes and GET-only API helpers. No `server-only`
 * import so `npx tsx scripts/fin/*` can use it; it never runs in a browser bundle.
 *
 * Rate limits (Xero: 60/min, 5,000/day, 5 concurrent): callers page sequentially;
 * a 429 honors Retry-After up to MAX_RETRIES, and a wait longer than
 * MAX_RETRY_WAIT_SECONDS (the daily limit) aborts instead of sleeping for hours.
 * A 401 refreshes once per request through the caller-supplied refresher.
 *
 * Logging: status codes, paths, counts only — never token values.
 */

export const SCOPES =
  "offline_access accounting.invoices.read accounting.contacts.read accounting.reports.profitandloss.read";

export const AUTHORIZE_URL = "https://login.xero.com/identity/connect/authorize";
const TOKEN_URL = "https://identity.xero.com/connect/token";
const CONNECTIONS_URL = "https://api.xero.com/connections";
export const API_BASE = "https://api.xero.com/api.xro/2.0";

export const FIN_XERO_REDIRECT_URI = "http://localhost:5555/callback";
export const FIN_XERO_TENANT_NAME = "TableX, LLC";

const MAX_RETRIES = 4;
const DEFAULT_RETRY_AFTER_SECONDS = 5;
const MAX_RETRY_WAIT_SECONDS = 120;

// ---------------------------------------------------------------------------
// Xero JSON boundary types (minimal — only the fields the warehouse reads)
// ---------------------------------------------------------------------------

/** Token endpoint response (authorization_code + refresh_token grants). */
export interface XeroTokenSet {
  access_token: string;
  /** ROTATING and single-use — Xero issues a new one on every refresh. */
  refresh_token: string;
  /** Seconds (access tokens live ~30 min). */
  expires_in: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
}

/** One entry from GET /connections. */
export interface XeroTenant {
  id: string;
  tenantId: string;
  tenantName: string | null;
  tenantType: string;
}

export interface XeroContactRef {
  ContactID: string;
  Name?: string;
  ContactNumber?: string;
}

export interface XeroLineItem {
  LineItemID?: string;
  Description?: string;
  ItemCode?: string;
  AccountCode?: string;
  Quantity?: number;
  UnitAmount?: number;
  LineAmount?: number;
  TaxAmount?: number;
  DiscountRate?: number;
}

export interface XeroInvoice {
  InvoiceID: string;
  InvoiceNumber?: string;
  Reference?: string;
  Type: string;
  Status: string;
  Contact?: XeroContactRef;
  Date?: string;
  DateString?: string;
  DueDate?: string;
  DueDateString?: string;
  FullyPaidOnDate?: string;
  LineAmountTypes?: string;
  SubTotal?: number;
  TotalTax?: number;
  Total?: number;
  AmountPaid?: number;
  AmountDue?: number;
  AmountCredited?: number;
  CurrencyCode?: string;
  UpdatedDateUTC?: string;
  LineItems?: XeroLineItem[];
  [key: string]: unknown;
}

export interface XeroInvoicesResponse {
  Invoices?: XeroInvoice[];
}

export interface XeroReportCell {
  Value?: string;
  Attributes?: { Id: string; Value: string }[];
}

export interface XeroReportRow {
  /** "Header" | "Section" | "Row" | "SummaryRow" */
  RowType: string;
  Title?: string;
  Cells?: XeroReportCell[];
  Rows?: XeroReportRow[];
}

export interface XeroReport {
  ReportID?: string;
  ReportName?: string;
  ReportTitles?: string[];
  ReportDate?: string;
  Rows?: XeroReportRow[];
}

export interface XeroReportsResponse {
  Reports?: XeroReport[];
}

// ---------------------------------------------------------------------------
// Env + errors
// ---------------------------------------------------------------------------

export interface FinXeroEnv {
  clientId: string;
  clientSecret: string;
}

/** OAuth app credentials, or null when FIN_XERO_CLIENT_ID / _SECRET are unset. */
export function getFinXeroEnv(): FinXeroEnv | null {
  const clientId = process.env.FIN_XERO_CLIENT_ID;
  const clientSecret = process.env.FIN_XERO_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export class XeroTokenError extends Error {
  constructor(public readonly code: "invalid_grant" | "http_error" | "not_configured") {
    super(`xero_token_${code}`);
    this.name = "XeroTokenError";
  }
}

export class XeroApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly path: string,
    public readonly detail?: string,
  ) {
    super(`xero_api_${status} ${path}${detail ? ` — ${detail}` : ""}`);
    this.name = "XeroApiError";
  }
}

// ---------------------------------------------------------------------------
// OAuth
// ---------------------------------------------------------------------------

export function buildAuthorizeUrl(state: string, redirectUri = FIN_XERO_REDIRECT_URI): string {
  const env = getFinXeroEnv();
  if (!env) throw new XeroTokenError("not_configured");
  const params = new URLSearchParams({
    response_type: "code",
    client_id: env.clientId,
    redirect_uri: redirectUri,
    scope: SCOPES,
    state,
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeAuthCode(
  code: string,
  redirectUri = FIN_XERO_REDIRECT_URI,
): Promise<XeroTokenSet> {
  return tokenRequest({ grant_type: "authorization_code", code, redirect_uri: redirectUri });
}

/**
 * Refresh the access token. The response carries a NEW refresh token; the old one
 * is dead the moment this succeeds — persist before using the access token.
 */
export async function refreshAccessToken(refreshToken: string): Promise<XeroTokenSet> {
  return tokenRequest({ grant_type: "refresh_token", refresh_token: refreshToken });
}

async function tokenRequest(params: Record<string, string>): Promise<XeroTokenSet> {
  const env = getFinXeroEnv();
  if (!env) throw new XeroTokenError("not_configured");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " + Buffer.from(`${env.clientId}:${env.clientSecret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params).toString(),
  });
  if (!res.ok) {
    let code: "invalid_grant" | "http_error" = "http_error";
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error === "invalid_grant") code = "invalid_grant";
    } catch {
      // unreadable body — keep the generic code
    }
    console.error("[fin-xero] token request failed", {
      status: res.status,
      grant: params.grant_type,
      code,
    });
    throw new XeroTokenError(code);
  }
  return (await res.json()) as XeroTokenSet;
}

/** Accounting (ORGANISATION) tenants this token can reach. */
export async function getConnections(accessToken: string): Promise<XeroTenant[]> {
  const res = await fetch(CONNECTIONS_URL, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
  });
  if (!res.ok) throw new XeroApiError(res.status, "/connections");
  return ((await res.json()) as XeroTenant[]).filter((t) => t.tenantType === "ORGANISATION");
}

// ---------------------------------------------------------------------------
// Accounting API GET
// ---------------------------------------------------------------------------

/**
 * Mutable auth shared across a run: a 401-triggered refresh writes the new token back
 * so later requests reuse it. `refresh` must PERSIST the rotated set before returning.
 */
export interface XeroAuth {
  token: string;
  tenantId: string;
  refresh?: () => Promise<string>;
}

export interface XeroGetOptions {
  headers?: Record<string, string>;
}

/**
 * GET an Accounting API path (relative to API_BASE, leading slash). Returns parsed JSON.
 * Throws XeroApiError on any non-2xx after retries — including 304 Not Modified,
 * which callers sending If-Modified-Since should treat as "no changes".
 */
export async function xeroGet<T>(auth: XeroAuth, path: string, opts: XeroGetOptions = {}): Promise<T> {
  let refreshed = false;
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
        "xero-tenant-id": auth.tenantId,
        Accept: "application/json",
        ...opts.headers,
      },
    });

    if (res.status === 429 && attempt < MAX_RETRIES) {
      const header = Number(res.headers.get("Retry-After"));
      const waitSeconds =
        Number.isFinite(header) && header > 0 ? header : DEFAULT_RETRY_AFTER_SECONDS;
      const problem = res.headers.get("X-Rate-Limit-Problem") ?? "unknown";
      if (waitSeconds > MAX_RETRY_WAIT_SECONDS) {
        throw new XeroApiError(429, path, `rate limit (${problem}) asks for ${waitSeconds}s — try again later`);
      }
      console.warn("[fin-xero] rate limited, waiting", { path, waitSeconds, problem, attempt });
      await sleep(waitSeconds * 1000);
      continue;
    }

    if (res.status === 401 && auth.refresh && !refreshed) {
      refreshed = true;
      console.warn("[fin-xero] access token rejected, refreshing", { path });
      auth.token = await auth.refresh();
      continue;
    }

    if (!res.ok) {
      let detail: string | undefined;
      if (res.status !== 304) {
        try {
          const text = await res.text();
          detail = text.slice(0, 300) || undefined;
        } catch {
          // ignore
        }
      }
      throw new XeroApiError(res.status, path, detail);
    }

    return (await res.json()) as T;
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
