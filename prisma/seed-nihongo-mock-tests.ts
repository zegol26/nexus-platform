import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "./seed-client";

type RawMockQuestion = {
  id: number;
  original_id?: number;
  level: string;
  test_type: string;
  section: string;
  sub_category: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

export async function seedNihongoMockTests() {
  const filePath = path.join(process.cwd(), "prisma", "data", "jlpt-n5-mock-test-bank.cleaned.json");
  const raw = JSON.parse(await readFile(filePath, "utf8")) as RawMockQuestion[];

  raw.forEach(validateMockQuestion);

  const existingCount = await prisma.nihongoMockTestQuestion.count({
    where: {
      level: "JLPT N5",
      testType: "mock_test",
    },
  });

  if (existingCount >= raw.length) {
    console.log(`JLPT N5 mock test questions already seeded: ${existingCount}`);
    return;
  }

  await prisma.nihongoMockTestQuestion.createMany({
    data: raw.map((question) => ({
      sourceKey: `jlpt-n5-${question.id}`,
      originalId: question.original_id ?? question.id,
      level: question.level,
      testType: question.test_type,
      section: question.section,
      subCategory: question.sub_category,
      question: question.question,
      options: question.options,
      correctAnswer: question.answer,
      explanation: question.explanation,
      isActive: true,
    })),
    skipDuplicates: true,
  });

  const bySection = raw.reduce<Record<string, number>>((acc, question) => {
    acc[question.section] = (acc[question.section] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`JLPT N5 mock test questions seeded: ${raw.length}`);
  console.log(`JLPT N5 mock test sections: ${JSON.stringify(bySection)}`);
}

function validateMockQuestion(question: RawMockQuestion) {
  const errors: string[] = [];

  if (!question.id) errors.push("missing id");
  if (question.level !== "JLPT N5") errors.push(`unsupported level: ${question.level}`);
  if (!question.question?.trim()) errors.push("empty question");
  if (!question.explanation?.trim()) errors.push("empty explanation");
  if (!Array.isArray(question.options) || question.options.length !== 4) errors.push("options length must be 4");
  if (new Set(question.options).size !== question.options.length) errors.push("duplicate options");
  if (!question.options.includes(question.answer)) errors.push("answer must exist in options");

  if (errors.length > 0) {
    throw new Error(`Invalid JLPT N5 mock question ${question.id}: ${errors.join("; ")}`);
  }
}
