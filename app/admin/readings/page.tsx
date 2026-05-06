import { AdminSection, EmptyState } from "@/components/admin/AdminTable";
import { prisma } from "@/lib/db/prisma";

export default async function AdminReadingsPage() {
  const readings = await prisma.readingPassage.findMany({
    where: { contentType: "READING" },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <AdminSection title="Readings" description="View cached and AI-generated reading passages.">
      {!readings.length ? <EmptyState label="No reading passages yet. Generate one from Reading Practice." /> : (
        <div className="grid gap-3">
          {readings.map((reading) => (
            <div key={reading.id} className="rounded-2xl border border-slate-200 p-4 text-sm">
              <p className="font-semibold">{reading.title}</p>
              <p className="mt-1 text-slate-500">{reading.level} - {reading.topic} - {reading.sourceType}</p>
            </div>
          ))}
        </div>
      )}
    </AdminSection>
  );
}
