// Monday.com GraphQL client.
//
// The token (MONDAY_API_TOKEN) is the Clear pH Agile workspace token, which
// has workspace-wide read/write access. To avoid accidental cross-board
// mutation, every call from this module must pass MONDAY_BOARD_ID from
// schema.ts explicitly. Never issue unscoped queries like `boards { id name }`
// or `list_workspaces`.

const MONDAY_API_URL = "https://api.monday.com/v2";
const API_VERSION = "2024-10";
const REQUEST_TIMEOUT_MS = 15_000;

export interface MondayQueryResult<T> {
  data: T;
}

interface MondayErrorShape {
  message: string;
  [key: string]: unknown;
}

interface MondayResponse<T> {
  data?: T;
  errors?: MondayErrorShape[];
}

export class MondayApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly errors?: MondayErrorShape[],
  ) {
    super(message);
    this.name = "MondayApiError";
  }
}

export async function mondayQuery<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const token = process.env.MONDAY_API_TOKEN;
  if (!token) {
    throw new MondayApiError(
      "Missing MONDAY_API_TOKEN environment variable. " +
        "Set it in .env.local with the Clear pH Agile workspace token.",
    );
  }

  const res = await fetch(MONDAY_API_URL, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
      "API-Version": API_VERSION,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new MondayApiError(
      `Monday API HTTP error: ${res.status} ${res.statusText}`,
      res.status,
    );
  }

  const body = (await res.json()) as MondayResponse<T>;

  if (body.errors && body.errors.length > 0) {
    throw new MondayApiError(
      body.errors.map((e) => e.message).join("; "),
      res.status,
      body.errors,
    );
  }

  if (!body.data) {
    throw new MondayApiError("Monday API returned no data");
  }

  return body.data;
}
