import { StoryArcContentAdminClient } from "@/components/apps/storyarc/StoryArcContentAdminClient";
import { prisma } from "@/lib/db/prisma";
import { STORYARC_FOUNDATION_FIXTURE } from "@/lib/storyarc/content/foundation-fixture";

export const dynamic = "force-dynamic";

export default async function StoryArcContentAdminPage() {
  const [rows, catalog, publishedStory] = await Promise.all([
    prisma.storyArcContentRevision.findMany({
      include: { item: true },
      orderBy: [{ createdAt: "desc" }],
      take: 50,
    }),
    prisma.storyArcContentRevision.findMany({
      select: { state: true, item: { select: { track: true, grade: true } } },
    }),
    prisma.storyArcContentRevision.findMany({
      where: { state: "PUBLISHED", item: { track: "STORY_MODE" } },
      include: { item: true },
      orderBy: { item: { stableId: "asc" } },
    }),
  ]);

  const stateCounts = catalog.reduce<Record<string, number>>((counts, revision) => {
    counts[revision.state] = (counts[revision.state] ?? 0) + 1;
    return counts;
  }, {});
  const published = catalog.filter((revision) => revision.state === "PUBLISHED");
  const publishedByTrack = published.reduce<Record<string, number>>((counts, revision) => {
    counts[revision.item.track] = (counts[revision.item.track] ?? 0) + 1;
    return counts;
  }, {});
  const publishedByGrade = published.reduce<Record<string, number>>((counts, revision) => {
    counts[revision.item.grade] = (counts[revision.item.grade] ?? 0) + 1;
    return counts;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
          StoryArc Admin
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Content operations</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Pusat kontrol katalog StoryArc: validasi paket resmi, terbitkan revisi yang sudah
          disetujui, pantau School Core, Story Mode, dan Exam Lab, serta simpan riwayat
          revisi tanpa mengubah progres learner.
        </p>
      </div>

      <StoryArcContentAdminClient
        initialPackage={JSON.stringify(STORYARC_FOUNDATION_FIXTURE, null, 2)}
        metrics={{
          totalPublished: published.length,
          draft: stateCounts.DRAFT ?? 0,
          inReview: stateCounts.IN_REVIEW ?? 0,
          approved: stateCounts.APPROVED ?? 0,
          schoolCore: publishedByTrack.SCHOOL_CORE ?? 0,
          storyMode: publishedByTrack.STORY_MODE ?? 0,
          examLab: publishedByTrack.EXAM_LAB ?? 0,
          grade10: publishedByGrade.GRADE_10 ?? 0,
          grade11: publishedByGrade.GRADE_11 ?? 0,
          grade12: publishedByGrade.GRADE_12 ?? 0,
        }}
        publishedStory={publishedStory.map((revision, index) => ({
          id: revision.id,
          episode: index + 1,
          stableId: revision.item.stableId,
          title: revision.title,
        }))}
        revisions={rows.map((row) => ({
          id: row.id,
          stableId: row.item.stableId,
          revision: row.revision,
          title: row.title,
          state: row.state,
          track: row.item.track,
          grade: row.item.grade,
        }))}
      />
    </div>
  );
}
