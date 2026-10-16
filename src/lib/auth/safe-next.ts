/** Only same-origin absolute paths; never `//host`, a full URL, or the login page itself. */
export function safeNext(next: string | null): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/login")) return null;
  return next;
}
