import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { canGeneratePmp, incrementPmpUsage } from "@/lib/pmp/access-guards";
import { fallbackModule, PMP_IPR_GUARDRAIL_PROMPT } from "@/lib/pmp/prompt";
import { trackEvent } from "@/lib/analytics/trackEvent";

export const dynamic = "force-dynamic";

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
  const topic =
    typeof body?.topic === "string" && body.topic.trim()
      ? body.topic.trim().slice(0, 120)
      : "Stakeholder engagement";
  const week =
    typeof body?.week === "string" && body.week.trim()
      ? body.week.trim().slice(0, 40)
      : "Week 1";

  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  const access = isAdmin ? { allowed: true } : await canGeneratePmp(user.id);
  if (!access.allowed) {
    return NextResponse.json(
      { error: access.reason ?? "PMP generator trial limit reached.", access },
      { status: 403 }
    );
  }

  await incrementPmpUsage(user.id);

  const fallback = fallbackModule(topic, week);

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ result: fallback, source: "fallback" });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.65,
      messages: [
        {
          role: "system",
          content: `${PMP_IPR_GUARDRAIL_PROMPT}

Return strict valid JSON only. Do not include markdown fences. Do not include copied source text. Use exactly this shape:
{
  "module_metadata": { "week": "...", "topic": "...", "eco_mapping": ["..."] },
  "the_real_world_vs_pmi_mindset": "...",
  "concept_in_plain_english": "...",
  "micro_learning_bullets": ["...", "..."],
  "exam_trap_alert": "..."
}`,
        },
        {
          role: "user",
          content: `Generate an original PMP study module. Module_Topic=${topic}. Target_Week=${week}. Explain with a custom analogy and no copied tables.`,
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
      metadata: { scope: "pmp_module", topic, week, source: "openai" },
    });

    return NextResponse.json({ result: parsed, source: "openai" });
  } catch (error) {
    console.error("[pmp/module] error", error);
    return NextResponse.json({ result: fallback, source: "fallback" });
  }
}
