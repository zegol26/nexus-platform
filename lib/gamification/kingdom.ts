import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export type GameRewardSource =
  | "FLASHCARD_CORRECT"
  | "QUIZ_CORRECT"
  | "MOCK_TEST_CORRECT"
  | "LESSON_COMPLETE"
  | "READING_COMPLETE"
  | "LISTENING_COMPLETE";

export type CastleStage = {
  name: string;
  min: number;
  max: number;
};

export const DAILY_XP_CAP = 1000;

const rewardTable: Record<GameRewardSource, { xp: number; buildPoints: number; coins: number }> = {
  FLASHCARD_CORRECT: { xp: 5, buildPoints: 3, coins: 1 },
  QUIZ_CORRECT: { xp: 10, buildPoints: 5, coins: 2 },
  MOCK_TEST_CORRECT: { xp: 15, buildPoints: 7, coins: 3 },
  LESSON_COMPLETE: { xp: 25, buildPoints: 10, coins: 5 },
  READING_COMPLETE: { xp: 20, buildPoints: 8, coins: 4 },
  LISTENING_COMPLETE: { xp: 20, buildPoints: 8, coins: 4 },
};

const castleStages: CastleStage[] = [
  { name: "Empty Land", min: 1, max: 4 },
  { name: "Starter Hut", min: 5, max: 9 },
  { name: "Wooden House", min: 10, max: 19 },
  { name: "Small Village", min: 20, max: 34 },
  { name: "Stone Residence", min: 35, max: 49 },
  { name: "Samurai Keep", min: 50, max: 64 },
  { name: "Castle Town", min: 65, max: 79 },
  { name: "Great Fortress", min: 80, max: 94 },
  { name: "Royal Castle", min: 95, max: 100 },
];

export function calculateCastleLevel(buildPoints: number) {
  return Math.min(100, Math.floor(Math.sqrt(Math.max(buildPoints, 0) / 10)) + 1);
}

export function getCastleStage(castleLevel: number) {
  return castleStages.find((stage) => castleLevel >= stage.min && castleLevel <= stage.max) ?? castleStages[0];
}

export function getProgressToNextLevel(buildPoints: number) {
  const castleLevel = calculateCastleLevel(buildPoints);
  if (castleLevel >= 100) {
    return { currentLevel: 100, nextLevel: 100, progressPercent: 100, pointsIntoLevel: 0, pointsNeeded: 0 };
  }

  const currentLevelStart = Math.pow(castleLevel - 1, 2) * 10;
  const nextLevelStart = Math.pow(castleLevel, 2) * 10;
  const pointsNeeded = Math.max(nextLevelStart - currentLevelStart, 1);
  const pointsIntoLevel = Math.max(buildPoints - currentLevelStart, 0);

  return {
    currentLevel: castleLevel,
    nextLevel: castleLevel + 1,
    progressPercent: Math.min(100, Math.round((pointsIntoLevel / pointsNeeded) * 100)),
    pointsIntoLevel,
    pointsNeeded,
  };
}

export function calculateAchievements(profile: {
  totalXP: number;
  buildPoints: number;
  coins: number;
  flashcardCorrectCount: number;
  quizCorrectCount: number;
  mockTestCorrectCount: number;
  lessonCompletedCount: number;
  readingCompletedCount: number;
}) {
  const castleLevel = calculateCastleLevel(profile.buildPoints);

  return [
    {
      id: "first_foundation",
      title: "Fondasi Pertama",
      description: "Bangun kerajaan sampai level 2.",
      unlocked: castleLevel >= 2,
    },
    {
      id: "flashcard_spark",
      title: "Flashcard Spark",
      description: "Jawab benar 25 flashcard.",
      unlocked: profile.flashcardCorrectCount >= 25,
    },
    {
      id: "quiz_runner",
      title: "Quiz Runner",
      description: "Jawab benar 50 soal quiz.",
      unlocked: profile.quizCorrectCount >= 50,
    },
    {
      id: "lesson_builder",
      title: "Lesson Builder",
      description: "Selesaikan 10 lesson.",
      unlocked: profile.lessonCompletedCount >= 10,
    },
    {
      id: "reading_scout",
      title: "Reading Scout",
      description: "Selesaikan 5 reading/listening practice.",
      unlocked: profile.readingCompletedCount >= 5,
    },
    {
      id: "royal_momentum",
      title: "Royal Momentum",
      description: "Kumpulkan 2.500 XP.",
      unlocked: profile.totalXP >= 2500,
    },
  ];
}

export async function getOrCreateGameProfile(userId: string) {
  const profile = await prisma.userGameProfile.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const achievements = calculateAchievements(profile);
  return {
    ...profile,
    castleLevel: calculateCastleLevel(profile.buildPoints),
    castleStage: getCastleStage(calculateCastleLevel(profile.buildPoints)),
    progressToNextLevel: getProgressToNextLevel(profile.buildPoints),
    achievements,
  };
}

export async function awardGameReward({
  userId,
  source,
  quantity = 1,
}: {
  userId: string;
  source: GameRewardSource;
  quantity?: number;
}) {
  const reward = rewardTable[source];
  const safeQuantity = Math.min(Math.max(Math.floor(quantity), 1), 100);
  const todayKey = toDateKey(new Date());

  return prisma.$transaction(async (tx) => {
    const current = await tx.userGameProfile.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    const existingTodayKey = current.xpTodayDate ? toDateKey(current.xpTodayDate) : null;
    const xpEarnedToday = existingTodayKey === todayKey ? current.xpEarnedToday : 0;

    if (xpEarnedToday >= DAILY_XP_CAP) {
      return {
        awarded: false,
        reason: "DAILY_CAP_REACHED",
        reward: { xp: 0, buildPoints: 0, coins: 0 },
        profile: await decorateProfile(current),
      };
    }

    const hasDailyBonus = current.lastDailyBonusDate ? toDateKey(current.lastDailyBonusDate) === todayKey : false;
    const requestedXp = reward.xp * safeQuantity + (hasDailyBonus ? 0 : 20);

    if (xpEarnedToday + requestedXp > DAILY_XP_CAP) {
      return {
        awarded: false,
        reason: "DAILY_CAP_REACHED",
        reward: { xp: 0, buildPoints: 0, coins: 0 },
        profile: await decorateProfile(current),
      };
    }

    const buildPoints = reward.buildPoints * safeQuantity;
    const coins = reward.coins * safeQuantity;

    const updateData: Prisma.UserGameProfileUpdateInput = {
      totalXP: { increment: requestedXp },
      buildPoints: { increment: buildPoints },
      coins: { increment: coins },
      xpEarnedToday: { set: xpEarnedToday + requestedXp },
      xpTodayDate: { set: new Date() },
      ...(hasDailyBonus ? {} : { lastDailyBonusDate: { set: new Date() } }),
      ...counterIncrement(source, safeQuantity),
    };

    const updated = await tx.userGameProfile.update({
      where: { userId },
      data: updateData,
    });

    const achievements = calculateAchievements(updated);
    const updatedWithAchievements = await tx.userGameProfile.update({
      where: { userId },
      data: { achievementsJson: achievements as Prisma.InputJsonValue },
    });

    return {
      awarded: true,
      reason: "AWARDED",
      reward: {
        xp: requestedXp,
        buildPoints,
        coins,
        dailyBonusXp: hasDailyBonus ? 0 : 20,
      },
      profile: await decorateProfile(updatedWithAchievements),
    };
  });
}

function counterIncrement(source: GameRewardSource, quantity: number) {
  if (source === "FLASHCARD_CORRECT") return { flashcardCorrectCount: { increment: quantity } };
  if (source === "QUIZ_CORRECT") return { quizCorrectCount: { increment: quantity } };
  if (source === "MOCK_TEST_CORRECT") return { mockTestCorrectCount: { increment: quantity } };
  if (source === "LESSON_COMPLETE") return { lessonCompletedCount: { increment: quantity } };
  return { readingCompletedCount: { increment: quantity } };
}

async function decorateProfile<T extends { buildPoints: number }>(profile: T) {
  const castleLevel = calculateCastleLevel(profile.buildPoints);
  return {
    ...profile,
    castleLevel,
    castleStage: getCastleStage(castleLevel),
    progressToNextLevel: getProgressToNextLevel(profile.buildPoints),
  };
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}
