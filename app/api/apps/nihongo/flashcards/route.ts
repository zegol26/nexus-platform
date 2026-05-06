import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { canUseFlashcard } from "@/lib/nexus/access-guards";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const deck = searchParams.get("deck");
  const level = searchParams.get("level");
  const limit = Number(searchParams.get("limit") ?? "80");
  const access = user.role === "ADMIN" || user.role === "SUPER_ADMIN"
    ? { allowed: true, plan: "ADMIN" }
    : await canUseFlashcard(user.id, limit);
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
