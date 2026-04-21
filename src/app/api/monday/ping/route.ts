import { NextResponse } from "next/server";

import { mondayQuery } from "@/lib/monday/client";
import { MONDAY_BOARD_ID } from "@/lib/monday/schema";

const PING_QUERY = `
  query ($boardId: [ID!]!) {
    boards(ids: $boardId) {
      id
      name
      groups { id }
      columns { id }
    }
  }
`;

interface PingResponse {
  boards: Array<{
    id: string;
    name: string;
    groups: Array<{ id: string }>;
    columns: Array<{ id: string }>;
  }>;
}

export async function POST() {
  try {
    const data = await mondayQuery<PingResponse>(PING_QUERY, {
      boardId: [MONDAY_BOARD_ID],
    });
    const board = data.boards?.[0];
    if (!board) {
      return NextResponse.json(
        { error: `Board ${MONDAY_BOARD_ID} not found` },
        { status: 500 },
      );
    }
    return NextResponse.json({
      boardName: board.name,
      groupCount: board.groups?.length ?? 0,
      columnCount: board.columns?.length ?? 0,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
