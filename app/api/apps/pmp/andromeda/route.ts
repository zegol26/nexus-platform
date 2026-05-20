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
  "Maaf, gw Andromeda — instructor khusus PMP prep. Pertanyaan barusan kelihatannya di luar scope PMP / project management.\n\nKalau lo lagi prep PMP, gw bisa langsung breakdown salah satu dari ini: **(a)** Process Groups vs Knowledge Areas, **(b)** Procurement & contract types (FFP/FPIF/T&M/CPFF/CPIF/CPAF), **(c)** Risk response strategies & EMV decision tree, atau **(d)** Conflict resolution (Thomas-Kilmann) di People domain.\n\nMau mulai dari mana? ✦";

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
        "Andromeda lagi belum tersambung ke compute layer (OPENAI_API_KEY belum di-set di environment). Sementara ini, lo bisa pakai **Course**, **Knowledge Base**, **ITTO Explorer**, atau **Simulator** di sidebar — semuanya udah aku susun dan ter-anchor ke kurikulum yang aku rancang. ✦",
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
      "Hmm, gw lagi kehilangan sinyal. Coba ulangi pertanyaannya, lebih spesifik kalau bisa.";

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
          "Andromeda lagi static — koneksi ke LLM gagal sebentar. Coba kirim ulang, atau buka **Knowledge Base** dulu untuk topik yang sama.",
        source: "fallback",
      },
      { status: 200 }
    );
  }
}
