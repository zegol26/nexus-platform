import Link from "next/link";
import { getServerSession } from "next-auth";
import { UserBadgeHeader } from "@/components/nihongo/UserBadgeHeader";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { parseListeningPassage } from "@/lib/nihongo/listening";

export default async function ListeningPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      })
    : null;

  const items = (
    await prisma.readingPassage.findMany({
      where: { contentType: "LISTENING" },
      orderBy: [{ level: "asc" }, { createdAt: "asc" }],
    })
  ).map(parseListeningPassage);

  const completedIds = user
    ? new Set(
        (
          await prisma.analyticsEvent.findMany({
            where: {
              userId: user.id,
              eventType: "LISTENING_COMPLETED",
              lessonId: { in: items.map((item) => item.id) },
            },
            select: { lessonId: true },
          })
        )
          .map((event) => event.lessonId)
          .filter(Boolean) as string[]
      )
    : new Set<string>();

  const total = items.length;
  const completed = items.filter((item) => completedIds.has(item.id)).length;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  const grouped = groupByLevel(items);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <UserBadgeHeader />

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-[linear-gradient(135deg,#111827,#0e7490,#047857)] p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100">
            Listening Roadmap
          </p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Listening Practice Roadmap
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-cyan-50">
                Train real Japanese listening with transcript, romaji, and Indonesian support.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Overall progress</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
          <StatCard label="Completed" value={`${completed}/${total}`} />
          <StatCard label="Current Level" value={items.find((item) => !completedIds.has(item.id))?.level ?? "N5"} />
          <StatCard label="Audio Library" value={`${total} items`} />
        </div>
      </section>

      {!items.length ? (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">Listening content belum tersedia.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Admin bisa upload audio dan JSON metadata dari Listening Manager.
          </p>
        </section>
      ) : (
        <section className="space-y-6">
          {Array.from(grouped.entries()).map(([level, levelItems]) => (
            <div key={level} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">{level}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">{level} listening path</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {levelItems.filter((item) => completedIds.has(item.id)).length}/{levelItems.length}
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {levelItems.map((item, index) => {
                  const isCompleted = completedIds.has(item.id);
                  return (
                    <Link
                      key={item.id}
                      href={`/apps/nihongo/listening/${item.id}`}
                      className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-white hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap gap-2 text-xs font-semibold">
                          <span className="rounded-full bg-cyan-50 px-3 py-1 text-cyan-700">{item.level}</span>
                          <span className="rounded-full bg-white px-3 py-1 text-slate-600">{item.category}</span>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {isCompleted ? "Complete" : "Open"}
                        </span>
                      </div>
                      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Listening {String(index + 1).padStart(2, "0")}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-950">{item.title}</h3>
                      <p className="mt-3 text-sm text-slate-500">
                        {item.durationSec ? `${Math.ceil(item.durationSec / 60)} min` : "Audio practice"} -{" "}
                        {item.lines.length} transcript lines
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function groupByLevel<T extends { level: string }>(items: T[]) {
  const grouped = new Map<string, T[]>();
  for (const item of items) {
    grouped.set(item.level, [...(grouped.get(item.level) ?? []), item]);
  }
  return grouped;
}
