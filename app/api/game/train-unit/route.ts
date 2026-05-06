import { NextResponse } from "next/server";
import { getGameUser } from "@/lib/game/auth";
import { trainUnit } from "@/lib/game/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getGameUser();
  if (!user) return NextResponse.json({ error: "Silakan login untuk training unit." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { unitKey?: unknown; quantity?: unknown } | null;
  const unitKey = typeof body?.unitKey === "string" ? body.unitKey : "";
  const quantity = typeof body?.quantity === "number" ? body.quantity : 1;
  try {
    return NextResponse.json({ kingdom: await trainUnit(user.id, unitKey, quantity) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Training gagal." }, { status: 400 });
  }
}
