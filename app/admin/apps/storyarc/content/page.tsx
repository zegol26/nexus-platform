import { prisma } from "@/lib/db/prisma";
import { STORYARC_FOUNDATION_FIXTURE } from "@/lib/storyarc/content/foundation-fixture";
import { StoryArcContentAdminClient } from "@/components/apps/storyarc/StoryArcContentAdminClient";

export const dynamic = "force-dynamic";

export default async function StoryArcContentAdminPage() {
  const [rows, publishedStory] = await Promise.all([
    prisma.storyArcContentRevision.findMany({
      include: { item: true },
      orderBy: [{ createdAt: "desc" }],
      take: 50,
    }),
    prisma.storyArcContentRevision.findMany({
      where: { state: "PUBLISHED", item: { track: "STORY_MODE" } },
      include: { item: true },
      orderBy: { item: { stableId: "asc" } },
    }),
  ]);
  return (
    <div className="space-y-6">
      <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">StoryArc</p><h1 className="mt-2 text-3xl font-semibold">Content lifecycle</h1><p className="mt-2 text-sm text-slate-600">Phase A uses the existing admin authorization boundary. Separate editor/reviewer/publisher roles remain an explicit product/security decision.</p></div>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-700">Admin only</p><h2 className="mt-1 text-xl font-semibold text-slate-950">Published Story Map</h2></div><span className="text-sm text-slate-500">{publishedStory.length} episodes</span></div>
        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">{publishedStory.map((revision, index) => <div key={revision.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-semibold text-blue-700">EP {String(index + 1).padStart(2, "0")} · {revision.item.stableId}</p><p className="mt-1 text-sm font-medium text-slate-900">{revision.title}</p></div>)}</div>
      </section>
      <StoryArcContentAdminClient
        initialPackage={JSON.stringify(STORYARC_FOUNDATION_FIXTURE, null, 2)}
        revisions={rows.map((row) => ({ id: row.id, stableId: row.item.stableId, revision: row.revision, title: row.title, state: row.state }))}
      />
    </div>
  );
}
