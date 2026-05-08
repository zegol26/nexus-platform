import { NextResponse } from "next/server";
import { getGameUser } from "@/lib/game/auth";
import { acknowledgeIncomingAttacks } from "@/lib/game/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getGameUser();
  if (!user) return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { battleIds?: unknown } | null;
  const battleIds = Array.isArray(body?.battleIds)
    ? body!.battleIds.filter((value): value is string => typeof value === "string")
    : undefined;
  const result = await acknowledgeIncomingAttacks(user.id, battleIds);
  return NextResponse.json(result);
}
