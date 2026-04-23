// Bearer-token auth for the read-only PM REST API at /api/pm/*.
//
// Set PM_API_TOKEN in .env.local. Callers (the MCP server, scripts) send:
//   Authorization: Bearer <PM_API_TOKEN>
//
// requireApiToken returns null on success, or a NextResponse to return early.
// Token is read from env on every request — no caching.

import { NextResponse } from "next/server";

export function requireApiToken(request: Request): NextResponse | null {
  const expected = process.env.PM_API_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { error: "PM API not configured." },
      { status: 503 },
    );
  }

  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = header.slice("Bearer ".length).trim();
  if (token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
