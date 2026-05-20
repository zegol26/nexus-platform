import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const processes = await prisma.pmpIttoProcess.findMany({
    include: { inputs: true, tools: true, outputs: true },
    orderBy: [{ sortOrder: "asc" }, { processName: "asc" }],
  });
  return NextResponse.json({ processes });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const process = await prisma.pmpIttoProcess.create({
    data: {
      processName: String(body.processName ?? "").trim(),
      processGroup: String(body.processGroup ?? "Planning").trim(),
      knowledgeArea: String(body.knowledgeArea ?? "Integration").trim(),
      domain: typeof body.domain === "string" ? body.domain : "Process",
      approach: typeof body.approach === "string" ? body.approach : "predictive",
      examVersion: typeof body.examVersion === "string" ? body.examVersion : "both",
      purpose: String(body.purpose ?? "").trim(),
      whenToUse: typeof body.whenToUse === "string" ? body.whenToUse : undefined,
      simpleExample: typeof body.simpleExample === "string" ? body.simpleExample : undefined,
      agileHybridNote: typeof body.agileHybridNote === "string" ? body.agileHybridNote : undefined,
      commonPitfall: typeof body.commonPitfall === "string" ? body.commonPitfall : undefined,
      studyTip: typeof body.studyTip === "string" ? body.studyTip : undefined,
    },
  });

  return NextResponse.json({ process }, { status: 201 });
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const id = String(body.id ?? "");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const process = await prisma.pmpIttoProcess.update({
    where: { id },
    data: {
      processName: typeof body.processName === "string" ? body.processName.trim() : undefined,
      processGroup: typeof body.processGroup === "string" ? body.processGroup.trim() : undefined,
      knowledgeArea: typeof body.knowledgeArea === "string" ? body.knowledgeArea.trim() : undefined,
      purpose: typeof body.purpose === "string" ? body.purpose.trim() : undefined,
      isActive: typeof body.isActive === "boolean" ? body.isActive : undefined,
    },
  });

  return NextResponse.json({ process });
}
