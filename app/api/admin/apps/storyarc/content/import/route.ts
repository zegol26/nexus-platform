import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { importStoryArcContentPackage } from "@/lib/storyarc/content/importer";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const contentPackage = body?.package ?? body;
  const dryRun = body?.dryRun !== false;
  const report = await importStoryArcContentPackage(contentPackage, { dryRun, actorId: admin.id });
  return NextResponse.json(report, { status: report.ok ? 200 : 422 });
}
