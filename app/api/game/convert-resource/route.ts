import { NextResponse } from "next/server";
import { getGameUser } from "@/lib/game/auth";
import { conversions } from "@/lib/game/config";
import { convertResource } from "@/lib/game/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getGameUser();
  if (!user) return NextResponse.json({ error: "Silakan login untuk konversi resource." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { conversionKey?: unknown } | null;
  const conversionKey = typeof body?.conversionKey === "string" ? body.conversionKey : "";
  if (!(conversionKey in conversions)) return NextResponse.json({ error: "Konversi tidak valid." }, { status: 400 });
  try {
    return NextResponse.json({ kingdom: await convertResource(user.id, conversionKey as keyof typeof conversions) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Konversi gagal." }, { status: 400 });
  }
}
