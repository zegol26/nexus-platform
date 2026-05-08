import { NextResponse } from "next/server";
import { getGameUser } from "@/lib/game/auth";
import { selectHero } from "@/lib/game/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getGameUser();
  if (!user) return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { heroKey?: unknown } | null;
  const heroKey = typeof body?.heroKey === "string" ? body.heroKey : "";
  if (!heroKey) {
    return NextResponse.json({ error: "Hero key wajib diisi." }, { status: 400 });
  }
  try {
    const kingdom = await selectHero(user.id, heroKey);
    return NextResponse.json({ kingdom });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal mengunci hero." },
      { status: 400 }
    );
  }
}
