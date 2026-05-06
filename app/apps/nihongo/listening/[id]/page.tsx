import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { UserBadgeHeader } from "@/components/nihongo/UserBadgeHeader";
import { ListeningPracticeClient } from "@/components/nihongo/ListeningPracticeClient";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { parseListeningPassage } from "@/lib/nihongo/listening";

export default async function ListeningDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      })
    : null;

  const passage = await prisma.readingPassage.findFirst({
    where: { id, contentType: "LISTENING" },
  });

  if (!passage) notFound();

  const completed = user
    ? Boolean(
        await prisma.analyticsEvent.findFirst({
          where: {
            userId: user.id,
            eventType: "LISTENING_COMPLETED",
            lessonId: passage.id,
          },
          select: { id: true },
        })
      )
    : false;

  return (
    <div className="space-y-6">
      <UserBadgeHeader />
      <ListeningPracticeClient item={parseListeningPassage(passage)} initiallyCompleted={completed} />
    </div>
  );
}
