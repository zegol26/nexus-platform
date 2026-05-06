import "dotenv/config";
import { prisma } from "@/lib/db/prisma";

async function main() {
  const u = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true, email: true },
  });
  if (!u) {
    console.log("no admin user");
    return;
  }

  const profile = await prisma.userGameProfile.findUnique({
    where: { userId: u.id },
  });
  const kingdom = await prisma.gameKingdom.findUnique({
    where: { userId: u.id },
    select: {
      id: true,
      name: true,
      xp: true,
      castleLevel: true,
      level: true,
      resourcesJson: true,
    },
  });

  console.log("admin:", u.email);
  console.log(
    "UserGameProfile:",
    profile
      ? {
          totalXP: profile.totalXP,
          buildPoints: profile.buildPoints,
          coins: profile.coins,
          xpEarnedToday: profile.xpEarnedToday,
          lessonCompletedCount: profile.lessonCompletedCount,
          flashcardCorrectCount: profile.flashcardCorrectCount,
          quizCorrectCount: profile.quizCorrectCount,
        }
      : null
  );
  console.log("GameKingdom:", kingdom);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
