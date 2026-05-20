import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const article = await prisma.pmpKnowledgeArticle.findUnique({ where: { slug } });
  if (!article || !article.isActive) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ article });
}
