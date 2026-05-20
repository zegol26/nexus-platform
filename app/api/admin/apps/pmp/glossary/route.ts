import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const terms = await prisma.pmpGlossaryTerm.findMany({ orderBy: { term: "asc" } });
  return NextResponse.json({ terms });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const term = await prisma.pmpGlossaryTerm.create({
    data: {
      term: String(body.term ?? "").trim(),
      acronym: typeof body.acronym === "string" ? body.acronym.trim() || null : undefined,
      category: typeof body.category === "string" ? body.category.trim() || null : undefined,
      definition: String(body.definition ?? "").trim(),
      simpleMeaning: typeof body.simpleMeaning === "string" ? body.simpleMeaning : undefined,
      example: typeof body.example === "string" ? body.example : undefined,
      pmpMindset: typeof body.pmpMindset === "string" ? body.pmpMindset : undefined,
      relatedTerms: Array.isArray(body.relatedTerms) ? body.relatedTerms.map(String) : [],
      approach: typeof body.approach === "string" ? body.approach : "general",
      examVersion: typeof body.examVersion === "string" ? body.examVersion : "both",
      difficulty: typeof body.difficulty === "string" ? body.difficulty : "medium",
    },
  });
  return NextResponse.json({ term }, { status: 201 });
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const id = String(body.id ?? "");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const term = await prisma.pmpGlossaryTerm.update({
    where: { id },
    data: {
      term: typeof body.term === "string" ? body.term.trim() : undefined,
      definition: typeof body.definition === "string" ? body.definition.trim() : undefined,
      isActive: typeof body.isActive === "boolean" ? body.isActive : undefined,
    },
  });
  return NextResponse.json({ term });
}
