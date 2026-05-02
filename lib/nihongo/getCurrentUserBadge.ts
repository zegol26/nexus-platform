import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export async function getCurrentUserBadge() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      nihongoProfile: {
        include: {
          badge: true,
        },
      },
    },
  });

  return user?.nihongoProfile ?? null;
}
