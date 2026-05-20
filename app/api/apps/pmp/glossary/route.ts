import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const terms = await prisma.pmpGlossaryTerm.findMany({
    where: {
      isActive: true,
      ...(q
        ? {
            OR: [
              { term: { contains: q, mode: "insensitive" } },
              { acronym: { contains: q, mode: "insensitive" } },
              { definition: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { term: "asc" },
  });

  return NextResponse.json({ terms });
}
