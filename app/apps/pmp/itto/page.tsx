import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { PmpProcessMap } from "@/components/apps/pmp/PmpProcessMap";

export const dynamic = "force-dynamic";

export default async function PmpIttoPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const processGroup = typeof params.processGroup === "string" ? params.processGroup : "";
  const knowledgeArea = typeof params.knowledgeArea === "string" ? params.knowledgeArea : "";
  const examVersion = typeof params.examVersion === "string" ? params.examVersion : "";

  const processes = await prisma.pmpIttoProcess.findMany({
    where: {
      isActive: true,
      ...(processGroup ? { processGroup } : {}),
      ...(knowledgeArea ? { knowledgeArea } : {}),
      ...(examVersion ? { examVersion } : {}),
      ...(q
        ? {
            OR: [
              { processName: { contains: q, mode: "insensitive" } },
              { purpose: { contains: q, mode: "insensitive" } },
              { inputs: { some: { name: { contains: q, mode: "insensitive" } } } },
              { tools: { some: { name: { contains: q, mode: "insensitive" } } } },
              { outputs: { some: { name: { contains: q, mode: "insensitive" } } } },
            ],
          }
        : {}),
    },
    include: { outputs: true },
    orderBy: [{ sortOrder: "asc" }, { processName: "asc" }],
  });

  const [groups, areas] = await Promise.all([
    prisma.pmpIttoProcess.findMany({ distinct: ["processGroup"], select: { processGroup: true }, orderBy: { processGroup: "asc" } }),
    prisma.pmpIttoProcess.findMany({ distinct: ["knowledgeArea"], select: { knowledgeArea: true }, orderBy: { knowledgeArea: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">ITTO Explorer</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Process Group x Knowledge Area Map</h1>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
          ITTO berguna untuk memahami project flow, tapi sukses PMP lebih bergantung pada scenario judgment,
          value delivery, stakeholder thinking, dan memilih best next action.
        </p>
      </section>

      <form className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900 p-4 md:grid-cols-4">
        <input name="q" defaultValue={q} placeholder="Search process, input, tool, output" className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white" />
        <select name="processGroup" defaultValue={processGroup} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white">
          <option value="">All process groups</option>
          {groups.map((item) => <option key={item.processGroup}>{item.processGroup}</option>)}
        </select>
        <select name="knowledgeArea" defaultValue={knowledgeArea} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white">
          <option value="">All knowledge areas</option>
          {areas.map((item) => <option key={item.knowledgeArea}>{item.knowledgeArea}</option>)}
        </select>
        <select name="examVersion" defaultValue={examVersion} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white">
          <option value="">All exam versions</option>
          <option value="current">Current</option>
          <option value="2026">2026</option>
          <option value="both">Both</option>
        </select>
        <button className="rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 md:col-span-4">Apply Filters</button>
      </form>

      {!q && !processGroup && !knowledgeArea && !examVersion ? (
        <PmpProcessMap processes={processes.map((process) => ({
          id: process.id,
          processName: process.processName,
          processGroup: process.processGroup,
          knowledgeArea: process.knowledgeArea,
        }))} />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {processes.map((process) => (
          <Link key={process.id} href={`/apps/pmp/itto/${process.id}`} prefetch={false} className="rounded-2xl border border-white/10 bg-slate-900 p-5 transition hover:border-cyan-300/60">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{process.processGroup} / {process.knowledgeArea}</p>
            <h2 className="mt-3 text-lg font-semibold text-white">{process.processName}</h2>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-300">{process.purpose}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {process.outputs.slice(0, 3).map((output) => (
                <span key={output.id} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">{output.name}</span>
              ))}
            </div>
            <p className="mt-4 text-xs font-semibold text-amber-100">{process.studyTip}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
