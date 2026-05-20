import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { canGeneratePmp, incrementPmpUsage } from "@/lib/pmp/access-guards";
import {
  fallbackExamItem,
  PMP_IPR_GUARDRAIL_PROMPT,
  type PmpApproach,
  type PmpDifficulty,
  type PmpDomain,
} from "@/lib/pmp/prompt";
import { trackEvent } from "@/lib/analytics/trackEvent";

export const dynamic = "force-dynamic";

const domains = new Set(["People", "Process", "Business Environment"]);
const approaches = new Set(["Agile", "Hybrid", "Predictive"]);
const difficulties = new Set(["Foundation", "Target", "Above_Target"]);

function extractJson(content: string) {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(content.slice(start, end + 1)) as unknown;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const domain = domains.has(body?.domain) ? (body.domain as PmpDomain) : "Process";
  const approach = approaches.has(body?.approach) ? (body.approach as PmpApproach) : "Agile";
  const difficulty = difficulties.has(body?.difficulty)
    ? (body.difficulty as PmpDifficulty)
    : "Target";

  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  const access = isAdmin ? { allowed: true } : await canGeneratePmp(user.id);
  if (!access.allowed) {
    return NextResponse.json(
      { error: access.reason ?? "PMP generator trial limit reached.", access },
      { status: 403 }
    );
  }

  await incrementPmpUsage(user.id);

  const fallback = fallbackExamItem(domain, approach, difficulty);

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ result: fallback, source: "fallback" });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `${PMP_IPR_GUARDRAIL_PROMPT}

Return strict valid JSON only. Do not include markdown fences. Do not include copied source text. Use exactly this shape:
{
  "item_id": "PMP-SAFE-XXXX",
  "metadata": { "domain": "...", "approach": "...", "difficulty": "..." },
  "scenario": "...",
  "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
  "correct_answer": "A",
  "explanation_engine": { "why_correct": "...", "why_distractors_fail": "..." }
}`,
        },
        {
          role: "user",
          content: `Generate a fully original PMP-style situational exam item. Domain=${domain}. Approach=${approach}. Difficulty=${difficulty}. Include one best-practice answer, one reactive distractor, one escalation trap, and one outdated command-control trap.`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";
    const parsed = extractJson(content) ?? fallback;

    await trackEvent({
      userId: user.id,
      eventType: "AI_TUTOR_MESSAGE",
      appSlug: "pmp",
      pagePath: "/apps/pmp/dashboard",
      metadata: { scope: "pmp_exam_item", domain, approach, difficulty, source: "openai" },
    });

    return NextResponse.json({ result: parsed, source: "openai" });
  } catch (error) {
    console.error("[pmp/exam] error", error);
    return NextResponse.json({ result: fallback, source: "fallback" });
  }
}
