import { NextResponse } from "next/server";

import { seedBoard } from "@/lib/monday/seed";

export const maxDuration = 300;

export async function POST() {
  try {
    const result = await seedBoard();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
