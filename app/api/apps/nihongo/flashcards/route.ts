import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { canUseFlashcard } from "@/lib/nexus/access-guards";
import {
  anonymousRateLimitResponse,
  checkAnonymousRateLimit,
  getAnonymousClientKey,
} from "@/lib/nexus/anonymous-rate-limit";
import { getAnonymousNihongoTrialAccess } from "@/lib/nexus/nihongo-trial";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deck = searchParams.get("deck");
  const level = searchParams.get("level");
  const limit = Number(searchParams.get("limit") ?? "80");
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    const rateLimit = checkAnonymousRateLimit({
      key: getAnonymousClientKey(request, "nihongo-trial:flashcards"),
      limit: 60,
      windowMs: 60_000,
    });

    if (!rateLimit.allowed) {
      return anonymousRateLimitResponse(rateLimit.resetAt);
    }
  }

  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, role: true },
      })
    : null;

  const access = !session?.user?.email
    ? getAnonymousNihongoTrialAccess(limit)
    : user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
      ? { allowed: true, plan: "ADMIN" }
      : user
        ? await canUseFlashcard(user.id, limit)
        : null;

  if (!access) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const takeLimit = access.limit ? Math.min(limit, access.limit) : limit;

  const where = {
    ...(deck ? { deck } : {}),
    ...(level ? { level } : {}),
  };

  const [flashcards, decks, levels, total] = await Promise.all([
    prisma.nihongoFlashcard.findMany({
      where,
      orderBy: [{ level: "asc" }, { deck: "asc" }, { createdAt: "asc" }],
      take: Math.min(Math.max(takeLimit, 1), 200),
    }),
    prisma.nihongoFlashcard.findMany({
      distinct: ["deck"],
      select: { deck: true },
      orderBy: { deck: "asc" },
    }),
    prisma.nihongoFlashcard.findMany({
      distinct: ["level"],
      select: { level: true },
      orderBy: { level: "asc" },
    }),
    prisma.nihongoFlashcard.count({ where }),
  ]);

  return NextResponse.json({
    flashcards,
    decks: decks.map((item: { deck: string }) => item.deck),
    levels: levels.map((item: { level: string }) => item.level),
    total,
    access,
  });
}
