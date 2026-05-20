import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { canGeneratePmp, incrementPmpUsage } from "@/lib/pmp/access-guards";
import { ANDROMEDA_PERSONA, isLikelyPmpScope } from "@/lib/pmp/prompt";
import { trackEvent } from "@/lib/analytics/trackEvent";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type ChatMessage = { role: "user" | "assistant"; content: string };

const OFF_TOPIC_REPLY =
  "That looks outside my study scope. Try one of these instead — **(a)** Process Groups vs Knowledge Areas, **(b)** contract types, **(c)** risk strategies, or **(d)** conflict resolution. ✦";

function sanitizeMessages(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return [];
  const result: ChatMessage[] = [];
  for (const m of input) {
    if (
      m &&
      typeof m === "object" &&
      typeof (m as { role: unknown }).role === "string" &&
      typeof (m as { content: unknown }).content === "string"
    ) {
      const role: ChatMessage["role"] =
        (m as { role: string }).role === "assistant" ? "assistant" : "user";
      const content = (m as { content: string }).content.trim().slice(0, 4000);
      if (content.length > 0) result.push({ role, content });
    }
  }
  return result.slice(-12);
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

  const body = await req.json().catch(() => ({}));
  const messages = sanitizeMessages(body?.messages);
  const latest = messages[messages.length - 1];

  if (!latest || latest.role !== "user" || !latest.content) {
    return NextResponse.json(
      { error: "messages array must end with a user turn." },
      { status: 400 }
    );
  }

  if (!isLikelyPmpScope(latest.content)) {
    return NextResponse.json({
      reply: OFF_TOPIC_REPLY,
      source: "guardrail",
      blocked: true,
    });
  }

  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  const access = isAdmin ? { allowed: true } : await canGeneratePmp(user.id);
  if (!access.allowed) {
    return NextResponse.json(
      { error: access.reason ?? "PMP Andromeda trial limit reached.", access },
      { status: 403 }
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      reply:
        "I'm offline right now. While you wait, the Course, Knowledge Base, ITTO Explorer, and Simulator are ready in the sidebar. ✦",
      source: "fallback",
    });
  }

  await incrementPmpUsage(user.id);

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.6,
      messages: [
        { role: "system", content: ANDROMEDA_PERSONA },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ??
      "Empty reply — try rephrasing the question.";

    await trackEvent({
      userId: user.id,
      eventType: "AI_TUTOR_MESSAGE",
      appSlug: "pmp",
      pagePath: "/apps/pmp/dashboard",
      metadata: {
        scope: "pmp_andromeda_chat",
        userTurnLength: latest.content.length,
        replyLength: reply.length,
      },
    });

    return NextResponse.json({ reply, source: "openai" });
  } catch (error) {
    console.error("[pmp/andromeda] error", error);
    return NextResponse.json(
      {
        reply:
          "Connection hiccup. Please try again, or open the Knowledge Base in the meantime.",
        source: "fallback",
      },
      { status: 200 }
    );
  }
}
