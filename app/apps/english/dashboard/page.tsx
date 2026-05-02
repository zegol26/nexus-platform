import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { EnglishInterviewClient } from "@/components/apps/english/EnglishInterviewClient";

export default async function EnglishDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  return <EnglishInterviewClient />;
}
