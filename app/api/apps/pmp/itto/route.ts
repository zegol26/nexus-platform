import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const processes = await prisma.pmpIttoProcess.findMany({
    where: {
      isActive: true,
      ...(q
        ? {
            OR: [
              { processName: { contains: q, mode: "insensitive" } },
              { purpose: { contains: q, mode: "insensitive" } },
              { inputs: { some: { name: { contains: q, mode: "insensitive" } } } },
              { tools: { some: { name: { contains: q, mode: "insensitive" } } } },
              { outputs: { some: { name: { contains: q, mode: "insensitive" } } } },
            ],
          }
        : {}),
    },
    include: { inputs: true, tools: true, outputs: true },
    orderBy: [{ sortOrder: "asc" }, { processName: "asc" }],
  });

  return NextResponse.json({ processes });
}
