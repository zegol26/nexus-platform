import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { isAdminRole, isValidAppAccess } from "@/lib/platform/access";

export function isStoryArcTeacherRole(role: string | null | undefined) {
  return role === "TEACHER" || isAdminRole(role);
}

export async function getStoryArcSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { appAccess: { include: { app: true } } },
  });
  if (!user) return null;
  const access = user.appAccess.find((row) => row.app.slug === "storyarc");
  if (!isStoryArcTeacherRole(user.role) && !isValidAppAccess(access)) return null;
  return user;
}
