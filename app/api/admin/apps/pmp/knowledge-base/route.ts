import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const articles = await prisma.pmpKnowledgeArticle.findMany({ orderBy: { title: "asc" } });
  return NextResponse.json({ articles });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const title = String(body.title ?? "").trim();
  const article = await prisma.pmpKnowledgeArticle.create({
    data: {
      slug: typeof body.slug === "string" && body.slug.trim() ? slugify(body.slug) : slugify(title),
      title,
      category: String(body.category ?? "PMP Mindset").trim(),
      domain: typeof body.domain === "string" ? body.domain : undefined,
      approach: typeof body.approach === "string" ? body.approach : "general",
      examVersion: typeof body.examVersion === "string" ? body.examVersion : "both",
      summary: String(body.summary ?? "").trim(),
      content: String(body.content ?? "").trim(),
      keyTakeaways: Array.isArray(body.keyTakeaways) ? body.keyTakeaways.map(String) : [],
      relatedTerms: Array.isArray(body.relatedTerms) ? body.relatedTerms.map(String) : [],
      studyTip: typeof body.studyTip === "string" ? body.studyTip : undefined,
    },
  });
  return NextResponse.json({ article }, { status: 201 });
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const id = String(body.id ?? "");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const article = await prisma.pmpKnowledgeArticle.update({
    where: { id },
    data: {
      title: typeof body.title === "string" ? body.title.trim() : undefined,
      summary: typeof body.summary === "string" ? body.summary.trim() : undefined,
      content: typeof body.content === "string" ? body.content.trim() : undefined,
      isActive: typeof body.isActive === "boolean" ? body.isActive : undefined,
    },
  });
  return NextResponse.json({ article });
}
