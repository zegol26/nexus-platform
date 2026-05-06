import { prisma } from "@/lib/db/prisma";

export async function canCreateCommunityRoom(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      gameProfile: { select: { flashcardCorrectCount: true } },
    },
  });

  if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") return true;

  // Integrasi badge formal bisa dipindah ke achievementsJson jika badge achievement disimpan permanen.
  return (user?.gameProfile?.flashcardCorrectCount ?? 0) >= 25;
}
