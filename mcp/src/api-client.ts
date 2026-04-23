const baseUrl = process.env.TABLEX_API_BASE_URL ?? "http://localhost:3000";
const token = process.env.TABLEX_API_TOKEN ?? "";

export async function pmGet<T = unknown>(path: string): Promise<T> {
  const url = `${baseUrl}/api/pm${path}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PM API ${path} failed: ${res.status} ${body}`);
  }
  return res.json() as Promise<T>;
}

export function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
  if (entries.length === 0) return "";
  const qs = new URLSearchParams();
  for (const [k, v] of entries) qs.set(k, String(v));
  return `?${qs.toString()}`;
}
