/**
 * Connect the "TableX Financials" Xero app to the TableX, LLC org and store the tokens
 * in fin_xero_tokens (single row; re-running replaces it).
 *
 * Usage:
 *   npx tsx scripts/fin/xero-connect.ts                 # opens the browser, waits on :5555
 *   npx tsx scripts/fin/xero-connect.ts --tenant <id>   # pick a tenant when several match
 *   npx tsx scripts/fin/xero-connect.ts --no-open       # just print the URL
 *
 * Requires FIN_XERO_CLIENT_ID, FIN_XERO_CLIENT_SECRET, NEXT_PUBLIC_SUPABASE_URL,
 * SUPABASE_SERVICE_ROLE_KEY in .env.local. Redirect URI registered on the Xero app:
 * http://localhost:5555/callback
 */
import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { join } from "path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import {
  buildAuthorizeUrl,
  exchangeAuthCode,
  getConnections,
  getFinXeroEnv,
  FIN_XERO_REDIRECT_URI,
  FIN_XERO_TENANT_NAME,
  type XeroTenant,
} from "../../src/lib/fin/xero/client";
import { saveConnection } from "../../src/lib/fin/xero/token-store";

config({ path: join(__dirname, "..", "..", ".env.local") });

const PORT = 5555;
const TIMEOUT_MS = 5 * 60 * 1000;

function argValue(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const TENANT_ARG = argValue("--tenant");
const NO_OPEN = process.argv.includes("--no-open");

function requireEnv(): void {
  const missing = ["FIN_XERO_CLIENT_ID", "FIN_XERO_CLIENT_SECRET", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]
    .filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`Missing env in .env.local: ${missing.join(", ")}`);
    process.exit(1);
  }
  if (!getFinXeroEnv()) process.exit(1);
}

function pickTenant(tenants: XeroTenant[]): XeroTenant | null {
  if (TENANT_ARG) return tenants.find((t) => t.tenantId === TENANT_ARG) ?? null;
  const named = tenants.filter((t) => (t.tenantName ?? "").trim() === FIN_XERO_TENANT_NAME);
  if (named.length === 1) return named[0];
  return null;
}

function waitForCode(state: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
      if (url.pathname !== "/callback") {
        res.writeHead(404).end("Not found");
        return;
      }
      const finish = (status: number, message: string) => {
        res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
        res.end(`<!doctype html><title>TableX Financials</title><p style="font:16px system-ui;padding:2rem">${message}</p>`);
        server.close();
      };
      const error = url.searchParams.get("error");
      if (error) {
        finish(400, `Xero returned an error: ${error}. You can close this tab.`);
        reject(new Error(`Xero authorize error: ${error}`));
        return;
      }
      if (url.searchParams.get("state") !== state) {
        finish(400, "State mismatch. Start the connect script again.");
        reject(new Error("OAuth state mismatch"));
        return;
      }
      const code = url.searchParams.get("code");
      if (!code) {
        finish(400, "No authorization code in the callback.");
        reject(new Error("Missing code"));
        return;
      }
      finish(200, "Connected. You can close this tab and return to the terminal.");
      resolve(code);
    });
    server.on("error", reject);
    server.listen(PORT, "127.0.0.1");
    setTimeout(() => {
      server.close();
      reject(new Error("Timed out waiting for the Xero callback (5 min)."));
    }, TIMEOUT_MS).unref();
  });
}

async function main(): Promise<void> {
  requireEnv();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const state = randomBytes(16).toString("hex");
  const url = buildAuthorizeUrl(state);
  const codePromise = waitForCode(state);

  console.log(`\nAuthorize the TableX Financials app (redirect ${FIN_XERO_REDIRECT_URI}):\n\n${url}\n`);
  if (!NO_OPEN && process.platform === "darwin") {
    spawn("open", [url], { stdio: "ignore", detached: true }).unref();
  }
  console.log(`Waiting for the callback on http://localhost:${PORT}/callback …`);

  const code = await codePromise;
  const tokens = await exchangeAuthCode(code);
  const tenants = await getConnections(tokens.access_token);
  if (tenants.length === 0) throw new Error("The grant has no accounting organisations connected.");

  const tenant = pickTenant(tenants);
  if (!tenant) {
    console.error(
      TENANT_ARG
        ? `No connected tenant has id ${TENANT_ARG}.`
        : `Could not pick exactly one tenant named "${FIN_XERO_TENANT_NAME}".`,
    );
    console.error("Connected tenants:");
    for (const t of tenants) console.error(`  ${t.tenantId}  ${t.tenantName ?? "(no name)"}`);
    console.error("Re-run with --tenant <tenantId>.");
    process.exit(1);
  }

  await saveConnection(supabase, {
    tenantId: tenant.tenantId,
    tenantName: tenant.tenantName,
    tokens,
  });
  console.log(`\nConnected to "${tenant.tenantName}" (${tenant.tenantId}). Tokens stored in fin_xero_tokens.`);
  console.log("Next: npx tsx scripts/fin/xero-pull.ts --dry-run --pages 1");
  process.exit(0);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
