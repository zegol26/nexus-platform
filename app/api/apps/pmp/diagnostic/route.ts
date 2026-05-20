import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { renderPmpDiagnosticMarkdown, type AnswerRecord } from "@/lib/pmp/diagnostic";

export const dynamic = "force-dynamic";

type RawDiagnosticRecord = {
  question?: unknown;
  domain?: unknown;
  chosen?: unknown;
  correct?: unknown;
  trap?: unknown;
  timeSeconds?: unknown;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const records: RawDiagnosticRecord[] = Array.isArray(body?.records)
    ? body.records
    : [];
  if (records.length === 0) {
    return NextResponse.json(
      { error: "records must be a non-empty answer matrix array." },
      { status: 400 }
    );
  }

  const safeRecords: AnswerRecord[] = records.slice(0, 180).map((record, index) => {
    const domain: AnswerRecord["domain"] =
      record?.domain === "People" ||
      record?.domain === "Process" ||
      record?.domain === "Business Environment" ||
      record?.domain === "Biz"
        ? record.domain
        : "Process";

    return {
      question:
        typeof record?.question === "number" && record.question > 0
          ? record.question
          : index + 1,
      domain,
      chosen: typeof record?.chosen === "string" ? record.chosen.trim().toUpperCase() : "",
      correct: typeof record?.correct === "string" ? record.correct.trim().toUpperCase() : "",
      trap: typeof record?.trap === "string" ? record.trap : "",
      timeSeconds: typeof record?.timeSeconds === "number" ? record.timeSeconds : undefined,
    };
  });

  return NextResponse.json({
    report: renderPmpDiagnosticMarkdown(safeRecords),
  });
}
