import type { PrismaClient } from "@prisma/client";

export type AssessmentTargetLevel = "N5" | "N4";

export type BankAssessmentQuestion = {
  id: string;
  sourceKey?: string;
  level: string;
  skill: string;
  questionType: string;
  prompt: string;
  passage: string | null;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: number;
  tags: string[];
};

const preAssessmentSkillCounts = {
  vocabulary: 5,
  grammar: 5,
  particle: 4,
  kanji: 3,
  reading: 3,
};

const fullAssessmentSkillCounts = {
  vocabulary: 10,
  grammar: 10,
  particle: 8,
  kanji: 6,
  reading: 6,
};

export async function generateAssessmentForLevel(
  prisma: PrismaClient,
  targetLevel: AssessmentTargetLevel,
  options?: { mode?: "pre_assessment" | "full" }
) {
  const counts = options?.mode === "full" ? fullAssessmentSkillCounts : preAssessmentSkillCounts;
  const selected: BankAssessmentQuestion[] = [];

  for (const [skill, count] of Object.entries(counts)) {
    const questions = await selectQuestionsForSkill(prisma, targetLevel, skill, count);
    selected.push(...questions);
  }

  const shuffled = shuffle(selected);
  validateGeneratedAssessment(shuffled);
  return shuffled;
}

async function selectQuestionsForSkill(
  prisma: PrismaClient,
  targetLevel: AssessmentTargetLevel,
  skill: string,
  count: number
) {
  if (targetLevel === "N5") {
    const bridgeCount = Math.max(1, Math.round(count * 0.3));
    const baseCount = count - bridgeCount;
    const [base, bridge] = await Promise.all([
      findBankQuestions(prisma, { level: "N5", skill, take: baseCount }),
      findBankQuestions(prisma, { level: "N4", skill, take: bridgeCount, maxDifficulty: 2 }),
    ]);
    return topUpQuestions(prisma, [...base, ...bridge], { level: "N5", skill, count });
  }

  const hardCount = Math.max(1, Math.round(count * 0.2));
  const baseCount = count - hardCount;
  const [base, hard] = await Promise.all([
    findBankQuestions(prisma, { level: "N4", skill, take: baseCount, maxDifficulty: 2 }),
    findBankQuestions(prisma, { level: "N4", skill, take: hardCount, minDifficulty: 3 }),
  ]);
  return topUpQuestions(prisma, [...base, ...hard], { level: "N4", skill, count });
}

async function topUpQuestions(
  prisma: PrismaClient,
  questions: BankAssessmentQuestion[],
  params: { level: string; skill: string; count: number }
) {
  const uniqueQuestions = dedupeQuestions(questions);

  if (uniqueQuestions.length >= params.count) {
    return uniqueQuestions.slice(0, params.count);
  }

  const topUp = await findBankQuestions(prisma, {
    level: params.level,
    skill: params.skill,
    take: params.count - uniqueQuestions.length,
    excludeIds: uniqueQuestions.map((question) => question.id),
  });

  return dedupeQuestions([...uniqueQuestions, ...topUp]).slice(0, params.count);
}

async function findBankQuestions(
  prisma: PrismaClient,
  params: {
    level: string;
    skill: string;
    take: number;
    minDifficulty?: number;
    maxDifficulty?: number;
    excludeIds?: string[];
  }
): Promise<BankAssessmentQuestion[]> {
  const rows = await prisma.assessmentQuestion.findMany({
    where: {
      id: params.excludeIds?.length ? { notIn: params.excludeIds } : undefined,
      level: params.level,
      skill: params.skill,
      isActive: true,
      ...(params.minDifficulty || params.maxDifficulty
        ? {
            difficulty: {
              ...(params.minDifficulty ? { gte: params.minDifficulty } : {}),
              ...(params.maxDifficulty ? { lte: params.maxDifficulty } : {}),
            },
          }
        : {}),
    },
    take: params.take * 4,
  });

  return dedupeQuestions(shuffle(rows).map((row) => ({
    id: row.id,
    level: row.level,
    skill: row.skill,
    questionType: row.questionType,
    prompt: row.prompt,
    passage: row.passage,
    options: Array.isArray(row.options) ? row.options.map(String) : [],
    correctAnswer: row.correctAnswer,
    explanation: row.explanation,
    difficulty: row.difficulty,
    tags: row.tags,
    sourceKey: row.sourceKey,
  }))).slice(0, params.take);
}

export function validateGeneratedAssessment(questions: BankAssessmentQuestion[]) {
  const errors: string[] = [];

  for (const question of questions) {
    if (question.options.length !== 4) errors.push(`${question.id}: options length must be 4`);
    if (new Set(question.options).size !== question.options.length) errors.push(`${question.id}: duplicate options`);
    if (!question.options.includes(question.correctAnswer)) errors.push(`${question.id}: correct answer missing`);
    if (question.skill === "reading") {
      if (!question.passage?.trim()) errors.push(`${question.id}: reading question must include passage`);
      if (isGenericReadingPrompt(question.prompt)) {
        errors.push(`${question.id}: reading question must not use only a generic instruction`);
      }
      if (!asksClearReadingTarget(question.prompt)) {
        errors.push(`${question.id}: reading question must ask a clear target`);
      }
    }
    if (
      question.skill === "particle" &&
      /^(です|ます|でした|ません|ありません|あります|います|ない)$/.test(question.correctAnswer)
    ) {
      errors.push(`${question.id}: particle question answer is not a particle`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Generated assessment is invalid: ${errors.join("; ")}`);
  }
}

function isGenericReadingPrompt(prompt: string) {
  const normalized = prompt.trim().toLowerCase();
  return [
    "baca teks, lalu pilih jawaban paling tepat",
    "baca teks pendek",
    "pilih jawaban paling tepat",
    "pilih jawaban yang benar",
    "jawaban paling tepat",
  ].some((generic) => normalized.includes(generic));
}

function asksClearReadingTarget(prompt: string) {
  return /本文の内容と合っているもの|本文によると|だれ|誰|何|どこ|いつ|なぜ|どうして|どうすれば|どれ|apa|siapa|di mana|dimana|kapan|mengapa|kenapa|bagaimana/i.test(
    prompt
  );
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function dedupeQuestions(questions: BankAssessmentQuestion[]) {
  const seen = new Set<string>();
  return questions.filter((question) => {
    const baseKey = (question.sourceKey ?? question.id).replace(/-v[2-5]$/, "");
    if (seen.has(baseKey)) return false;
    seen.add(baseKey);
    return true;
  });
}
