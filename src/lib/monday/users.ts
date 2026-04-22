// Fetch Monday workspace users for Owner column mapping.
//
// One query per reconcile call — small payload, low complexity. The token's
// workspace scope makes this safe; we don't need to filter to a specific
// account beyond what Monday already enforces.

import { mondayQuery } from "./client";

const Q_USERS = `
  query {
    users(limit: 200) {
      id
      email
      name
    }
  }
`;

export interface MondayUser {
  id: string;
  email: string | null;
  name: string | null;
}

export async function fetchMondayUsers(): Promise<MondayUser[]> {
  const data = await mondayQuery<{ users: MondayUser[] }>(Q_USERS);
  return data.users ?? [];
}
