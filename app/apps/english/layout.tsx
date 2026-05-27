import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { IdleLogout } from "@/components/platform/IdleLogout";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { isAdminRole, isValidAppAccess } from "@/lib/platform/access";

export const dynamic = "force-dynamic";

export default async function EnglishLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { appAccess: { include: { app: true } } },
  });

  if (!user) {
    redirect("/login");
  }

  const englishAccess = user.appAccess.find(
    (access) => access.app.slug === "english" && access.status === "ACTIVE"
  );

  if (!isAdminRole(user.role) && !isValidAppAccess(englishAccess)) {
    redirect("/platform/dashboard");
  }

  return (
    <>
      {children}
      <IdleLogout />
    </>
  );
}
