import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { canAskAiTutor, incrementFeatureUsage } from "@/lib/nexus/access-guards";
import { trackEvent } from "@/lib/analytics/trackEvent";
import { findModule, findPersona } from "@/lib/english/dce";
import { enforceJohnEnglishOnly } from "@/lib/english/john-language-policy";

// Generates an opening roleplay turn the John conversation page can use
// to seed a scripted scenario. The runtime conversation continues
// through the regular /api/apps/english/john endpoint with the same
// personaSlug + cefrLevel so John stays in character.

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
  const level = typeof body?.level === "string" ? body.level : null;
  const moduleSlug = typeof body?.moduleSlug === "string" ? body.moduleSlug : null;
  const roleplayId = typeof body?.roleplayId === "string" ? body.roleplayId : null;

  if (!level || !moduleSlug || !roleplayId) {
    return NextResponse.json(
      { error: "level, moduleSlug, and roleplayId are required" },
      { status: 400 }
    );
  }

  const lookup = findModule(level, moduleSlug);
  if (!lookup) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  const roleplay = lookup.module.roleplay.find((rp) => rp.id === roleplayId);
  if (!roleplay) {
    return NextResponse.json({ error: "Roleplay not found" }, { status: 404 });
  }

  const persona = findPersona(roleplay.personaSlug);
  if (!persona) {
    return NextResponse.json({ error: "Persona not found" }, { status: 404 });
  }

  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  const access = isAdmin ? { allowed: true } : await canAskAiTutor(user.id);
  if (!access.allowed) {
    return NextResponse.json(
      { error: access.reason ?? "AI Tutor trial limit reached." },
      { status: 403 }
    );
  }

  await incrementFeatureUsage(user.id, "AI_TUTOR_QUESTION");

  await trackEvent({
    userId: user.id,
    eventType: "AI_TUTOR_MESSAGE",
    pagePath: "/apps/english/dce",
    metadata: {
      scope: "dce_roleplay_open",
      level,
      moduleSlug,
      roleplayId,
      personaSlug: persona.slug,
    },
  });

  // The opening line is authored content — return it directly so the
  // first character on screen is consistent. If OpenAI is configured
  // we slightly tailor it; otherwise we fall back to the seed line.
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      opening: roleplay.openingLine,
      persona,
      roleplay: {
        id: roleplay.id,
        scenario: roleplay.scenario,
        goal: roleplay.goal,
        turns: roleplay.turns,
      },
      level,
      moduleSlug,
    });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `You generate a single opening line for a roleplay scenario. Stay fully in character as ${persona.name} (${persona.role}). Personality: ${persona.personality}. CEFR level: ${lookup.level.cefrRange}. Output ONLY the line, no narration, no quotes. English only: do not use Japanese, Chinese, Korean, Arabic, Cyrillic, or any non-Latin script.`,
        },
        {
          role: "user",
          content: `Scenario: ${roleplay.scenario}\nLearner goal: ${roleplay.goal}\nDefault opening: "${roleplay.openingLine}"\nGenerate a fresh natural variant of the opening line that sounds slightly different but fits the same scenario.`,
        },
      ],
    });

    const generated = enforceJohnEnglishOnly(
      completion.choices[0]?.message?.content?.trim().replace(/^"|"$/g, "") ||
        roleplay.openingLine
    );

    return NextResponse.json({
      opening: generated,
      persona,
      roleplay: {
        id: roleplay.id,
        scenario: roleplay.scenario,
        goal: roleplay.goal,
        turns: roleplay.turns,
      },
      level,
      moduleSlug,
    });
  } catch (error) {
    console.error("[dce/roleplay] error", error);
    return NextResponse.json({
      opening: roleplay.openingLine,
      persona,
      roleplay: {
        id: roleplay.id,
        scenario: roleplay.scenario,
        goal: roleplay.goal,
        turns: roleplay.turns,
      },
      level,
      moduleSlug,
    });
  }
}
