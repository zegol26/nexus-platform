import { redirect } from "next/navigation";
import { JohnChatClient } from "@/components/apps/english/john/JohnChatClient";
import { getStoryArcSessionUser } from "@/lib/storyarc/access";
import { getStoryArcJohnUsage } from "@/lib/storyarc/john/usage";
import { STORYARC_JOHN_CONTEXT } from "@/lib/storyarc/language/context";

export const dynamic = "force-dynamic";

export default async function StoryArcJohnPage() {
  const user = await getStoryArcSessionUser();
  if (!user) redirect("/platform/dashboard");
  const usage = await getStoryArcJohnUsage(user.id);

  return (
    <JohnChatClient
      apiEndpoint="/api/apps/storyarc/john"
      courseId={STORYARC_JOHN_CONTEXT.courseId}
      contextId={STORYARC_JOHN_CONTEXT.contextId}
      pagePath="/apps/storyarc/john"
      appKicker="Nexus StoryArc · John"
      title="Conversation with AI John"
      description="Practice StoryArc English by text or voice with the same John coach used in Nexus AI English. Each learner receives five requests per day."
      backHref="/apps/storyarc"
      backLabel="Back to StoryArc"
      initialUsage={usage}
    />
  );
}
