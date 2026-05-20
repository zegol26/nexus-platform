import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ processId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { processId } = await params;
  const process = await prisma.pmpIttoProcess.findUnique({
    where: { id: processId },
    include: { inputs: true, tools: true, outputs: true },
  });

  if (!process || !process.isActive) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ process });
}
