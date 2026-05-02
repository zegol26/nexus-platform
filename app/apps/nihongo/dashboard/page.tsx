import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { NihongoDashboardClient } from "@/components/apps/nihongo/NihongoDashboardClient";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      nihongoProfile: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  if (!user.nihongoProfile?.assessmentCompletedAt) {
    redirect("/apps/nihongo/pre-assessment");
  }

  return <NihongoDashboardClient />;
}
