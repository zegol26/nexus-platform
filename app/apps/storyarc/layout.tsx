import { redirect } from "next/navigation";
import { IdleLogout } from "@/components/platform/IdleLogout";
import { StoryArcShell } from "@/components/apps/storyarc/StoryArcShell";
import { getStoryArcSessionUser } from "@/lib/storyarc/access";
import "./storyarc.css";

export const dynamic = "force-dynamic";

export default async function StoryArcLayout({ children }: { children: React.ReactNode }) {
  const user = await getStoryArcSessionUser();
  if (!user) redirect("/platform/dashboard");

  return (
    <StoryArcShell playerName={(user.name ?? user.email).slice(0, 48)} role={user.role}>
      {children}
      <IdleLogout />
    </StoryArcShell>
  );
}
