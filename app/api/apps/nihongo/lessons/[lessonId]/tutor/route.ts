import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { canAskAiTutor, incrementFeatureUsage } from "@/lib/nexus/access-guards";
import { trackEvent } from "@/lib/analytics/trackEvent";

export async function POST(
  request: Request,
  context: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await context.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    message?: string;
    currentTemplateMd?: string;
    listeningScript?: string;
  };

  if (!body.message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { nihongoProfile: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  const access = isAdmin ? { allowed: true } : await canAskAiTutor(user.id);
  if (!access.allowed) {
    return NextResponse.json({ error: access.reason ?? "AI Tutor trial limit reached.", access }, { status: 403 });
  }

  const lesson = await prisma.nihongoLesson.findUnique({
    where: { id: lessonId },
    include: {
      templates: {
        orderBy: { variant: "asc" },
        take: 1,
      },
    },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  await prisma.nihongoLessonTutorMessage.create({
    data: {
      lessonId,
      userId: user.id,
      role: "user",
      content: body.message,
    },
  });

  // Count usage for everyone (admin included) so the cost dashboard
  // sees admin chats too. Quota gating above already exempts admins.
  await incrementFeatureUsage(user.id, "AI_TUTOR_QUESTION");

  const reply = await buildTutorReply({
    message: body.message,
    lessonTitle: lesson.title,
    lessonLevel: lesson.level,
    lessonDescription: lesson.description,
    weaknessTags: user.nihongoProfile?.weaknessTags ?? [],
    currentTemplateMd: body.currentTemplateMd ?? lesson.templates[0]?.contentMd ?? "",
    listeningScript: body.listeningScript ?? "",
  });

  await prisma.nihongoLessonTutorMessage.create({
    data: {
      lessonId,
      userId: user.id,
      role: "assistant",
      content: reply,
    },
  });

  // Persist the full turn into AnalyticsEvent so the admin keyword
  // panel can mine both the learner question and the AI reply
  // alongside free-chat tutor turns. Capped per side to keep rows
  // small if a learner pastes a long block.
  await trackEvent({
    userId: user.id,
    eventType: "AI_TUTOR_MESSAGE",
    lessonId,
    pagePath: `/apps/nihongo/curriculum/${lessonId}`,
    metadata: {
      messageLength: body.message.length,
      replyLength: reply.length,
      mode: "text",
      scope: "lesson",
      userMessage: body.message.slice(0, 4000),
      assistantReply: reply.slice(0, 4000),
    },
  });

  return NextResponse.json({ reply });
}

async function buildTutorReply(params: {
  message: string;
  lessonTitle: string;
  lessonLevel: string;
  lessonDescription: string | null;
  weaknessTags: string[];
  currentTemplateMd: string;
  listeningScript: string;
}) {
  if (!process.env.OPENAI_API_KEY) {
    return `Tutor fallback aktif untuk lesson "${params.lessonTitle}".

Pertanyaanmu:
${params.message}

Jawaban singkat:
Fokus dulu pada pola utama lesson ini. Kalau ada partikel, cari kata sebelum partikelnya. Kalau ada bentuk kata kerja, cek waktunya: sekarang, negatif, lampau, atau lampau negatif.

Contoh:
日本語を勉強します。
Romaji: Nihongo o benkyou shimasu.
Arti: Saya belajar bahasa Jepang.

Latihan kecil: buat satu kalimat baru dengan pola yang sama.`;
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_TUTOR_MODEL ?? "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are Nexus AI Nihongo Tutor for Indonesian learners. Answer Indonesian-first, beginner-friendly, focused on the current lesson. Include Japanese, romaji, and Indonesian meaning when useful. Do not over-answer.",
        },
        {
          role: "user",
          content: JSON.stringify(params),
        },
      ],
    });

    return completion.choices[0]?.message?.content ?? "Tutor belum menghasilkan jawaban.";
  } catch (error) {
    console.error(error);
    return `Tutor fallback aktif karena AI provider belum bisa dihubungi.

Untuk lesson "${params.lessonTitle}", pecah pertanyaanmu menjadi: arti kosakata, fungsi partikel, dan bentuk kata kerja. Kirim bagian yang paling membingungkan, lalu coba buat satu contoh pendek.`;
  }
}
