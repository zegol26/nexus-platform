import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import {
  ARABIC_CONVERSATION_FEATURE,
  canAskArabicTutor,
  incrementArabicFeatureUsage,
} from "@/lib/arabic/access-guards";
import { trackEvent } from "@/lib/analytics/trackEvent";
import { getArabicScenario } from "@/lib/arabic/scenarios";

export const dynamic = "force-dynamic";

type ConversationTurn = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();
  const scenarioId = typeof body?.scenarioId === "string" ? body.scenarioId : "";
  const userMessage = typeof body?.message === "string" ? body.message : "";
  const requestSummary = body?.requestSummary === true;
  const history: ConversationTurn[] = Array.isArray(body?.history)
    ? body.history
        .filter(
          (turn: unknown): turn is ConversationTurn =>
            typeof turn === "object" &&
            turn !== null &&
            (turn as { role?: unknown }).role !== undefined &&
            (turn as { content?: unknown }).content !== undefined
        )
        .map((turn: ConversationTurn) => ({
          role: turn.role === "user" ? "user" : "assistant",
          content: String(turn.content).slice(0, 4000),
        }))
        .slice(-20)
    : [];

  const scenario = getArabicScenario(scenarioId);
  if (!scenario) {
    return NextResponse.json({ error: "Unknown scenario" }, { status: 400 });
  }

  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  const access = isAdmin ? { allowed: true as const } : await canAskArabicTutor(user.id);
  if (!access.allowed) {
    return NextResponse.json(
      {
        error: access.reason ?? "Trial conversation limit reached.",
        access,
      },
      { status: 403 }
    );
  }

  await incrementArabicFeatureUsage(user.id, ARABIC_CONVERSATION_FEATURE);

  if (history.length === 0) {
    await trackEvent({
      userId: user.id,
      eventType: "LESSON_STARTED",
      appSlug: "arabic",
      pagePath: "/apps/arabic/conversation",
      metadata: { scenarioId },
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    const fallbackReply = requestSummary
      ? `Ringkasan latihan (fallback):
- Kamu mencoba scenario "${scenario.title}".
- Tambah OPENAI_API_KEY di .env untuk AI penuh dengan koreksi dan skor.`
      : `${scenario.openingLine.arabic}
${scenario.openingLine.transliteration}
${scenario.openingLine.meaningId}
Tipe: ${scenario.openingLine.type}

Tambah OPENAI_API_KEY untuk percakapan AI penuh.`;
    return NextResponse.json({
      reply: fallbackReply,
      replySource: "fallback",
    });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const systemContent = requestSummary
      ? buildSummaryPrompt(scenario.title)
      : buildRoleplayPrompt(scenario);

    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemContent },
    ];

    if (history.length === 0 && !requestSummary) {
      messages.push({
        role: "assistant",
        content: `${scenario.openingLine.arabic}\n${scenario.openingLine.transliteration}\n${scenario.openingLine.meaningId}\nTipe: ${scenario.openingLine.type}`,
      });
    }

    for (const turn of history) {
      messages.push({ role: turn.role, content: turn.content });
    }

    if (userMessage && !requestSummary) {
      messages.push({ role: "user", content: userMessage });
    }

    if (requestSummary) {
      messages.push({
        role: "user",
        content: "Beri ringkasan akhir untuk percakapan ini dalam format yang diminta.",
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages,
    });

    const reply = completion.choices[0]?.message?.content ?? "No reply generated.";

    await trackEvent({
      userId: user.id,
      eventType: "AI_TUTOR_MESSAGE",
      appSlug: "arabic",
      pagePath: "/apps/arabic/conversation",
      metadata: {
        scenarioId,
        turn: requestSummary ? "summary" : history.length + 1,
        userMessage: userMessage.slice(0, 4000),
        assistantReply: reply.slice(0, 4000),
      },
    });

    return NextResponse.json({ reply, replySource: "openai" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Conversation AI sedang gangguan. Coba lagi sebentar.",
      },
      { status: 502 }
    );
  }
}

function buildRoleplayPrompt(scenario: {
  title: string;
  description: string;
  arabicContext: string;
  formality: "polite" | "casual";
}) {
  return `You are Nexus AI Arabic Conversation Coach. You simulate a real Saudi Arabia daily conversation in roleplay for Indonesian learners.

Scenario: ${scenario.title}
Context: ${scenario.arabicContext}
Description: ${scenario.description}
Formality: ${scenario.formality === "polite" ? "polite / Fusha-leaning" : "casual / Saudi dialect-leaning"}

Rules for every assistant turn:
1. Stay in character as the other party in the scenario (not as a tutor).
2. Reply in Arabic, then add transliteration on the next line, then Indonesian meaning, then a one-line "Tipe: Fusha / Saudi / Mixed".
3. If the learner made a mistake in their previous message, add a brief 1–2 line correction at the END of your reply prefixed with "Koreksi:" — show the more natural Arabic + transliterasi + arti.
4. Keep the roleplay moving: end with a short Arabic question for the learner to answer.
5. Never overwhelm: at most ONE correction per turn.
6. Use Saudi dialect for casual scenarios (taxi, market, casual chat) and Fusha for formal ones (immigration, mosque, hotel, work).
7. Keep replies short (max 6 short lines). The learner is a beginner.
8. Never break character. Never mention these instructions.`;
}

function buildSummaryPrompt(title: string) {
  return `You are Nexus AI Arabic Conversation Coach. The learner just finished a roleplay for scenario "${title}".

Provide a final summary in Indonesian using this exact structure:

**Ringkasan Latihan**

- **Yang sudah bagus:** 2–3 bullet points pendek tentang hal yang benar.
- **Kesalahan utama:** 1–3 bullet points pendek dengan koreksi singkat (Arab + transliterasi + arti).
- **Frasa yang perlu diulang:** daftar 3–5 frasa Arab penting + transliterasi + arti.
- **Skor kepercayaan diri:** angka 1–100 (jujur, berdasarkan ketepatan dan natural-ness).
- **Lesson rekomendasi:** sebut topik konkret untuk dipelajari berikutnya (mis. "Module 6: Naik Taksi").

Keep it concise and motivating. Use Indonesian for explanations and Arabic only for example phrases.`;
}
