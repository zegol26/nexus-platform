import { AdminSection } from "@/components/admin/AdminTable";
import { ListeningManagerClient } from "@/components/admin/ListeningManagerClient";
import { prisma } from "@/lib/db/prisma";

export default async function AdminListeningPage() {
  const entries = await prisma.readingPassage.findMany({
    where: { contentType: "LISTENING" },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      title: true,
      level: true,
      topic: true,
      audioUrl: true,
      createdAt: true,
    },
  });

  return (
    <AdminSection
      title="Listening Manager"
      description="Upload audio, import JSON metadata, and manage the Nihongo listening library."
    >
      <ListeningManagerClient initialEntries={entries} />
    </AdminSection>
  );
}
