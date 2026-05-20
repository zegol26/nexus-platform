import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function PmpGlossaryPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const category = typeof params.category === "string" ? params.category : "";
  const approach = typeof params.approach === "string" ? params.approach : "";
  const examVersion = typeof params.examVersion === "string" ? params.examVersion : "";

  const terms = await prisma.pmpGlossaryTerm.findMany({
    where: {
      isActive: true,
      ...(category ? { category } : {}),
      ...(approach ? { approach } : {}),
      ...(examVersion ? { examVersion } : {}),
      ...(q
        ? {
            OR: [
              { term: { contains: q, mode: "insensitive" } },
              { acronym: { contains: q, mode: "insensitive" } },
              { definition: { contains: q, mode: "insensitive" } },
              { simpleMeaning: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { term: "asc" },
  });

  const categories = await prisma.pmpGlossaryTerm.findMany({
    distinct: ["category"],
    where: { category: { not: null } },
    select: { category: true },
    orderBy: { category: "asc" },
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">PMP Glossary</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">General Terms, PMIism, Agile, Hybrid, and 2026 Readiness</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Penjelasan bilingual: bahasa Indonesia sebagai main explanation, PMP terms tetap English, contoh dibuat praktis dan original.
        </p>
      </section>

      <form className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900 p-4 md:grid-cols-4">
        <input name="q" defaultValue={q} placeholder="Search term or acronym" className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white" />
        <select name="category" defaultValue={category} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white">
          <option value="">All categories</option>
          {categories.map((item) => item.category ? <option key={item.category}>{item.category}</option> : null)}
        </select>
        <select name="approach" defaultValue={approach} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white">
          <option value="">All approaches</option>
          <option value="general">General</option>
          <option value="predictive">Predictive</option>
          <option value="agile">Agile</option>
          <option value="hybrid">Hybrid</option>
        </select>
        <select name="examVersion" defaultValue={examVersion} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white">
          <option value="">All exam versions</option>
          <option value="current">Current</option>
          <option value="2026">2026</option>
          <option value="both">Both</option>
        </select>
        <button className="rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 md:col-span-4">Apply Filters</button>
      </form>

      <div className="flex flex-wrap gap-2">
        {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
          <a key={letter} href={`#${letter}`} className="rounded-md bg-white/10 px-2 py-1 text-xs font-bold text-slate-200">{letter}</a>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {terms.map((term) => (
          <article key={term.id} id={term.term[0]?.toUpperCase()} className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{term.category} / {term.examVersion}</p>
            <h2 className="mt-3 text-xl font-semibold text-white">{term.term}{term.acronym ? ` (${term.acronym})` : ""}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{term.simpleMeaning}</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">{term.definition}</p>
            {term.example ? <p className="mt-3 text-sm leading-6 text-cyan-100">{term.example}</p> : null}
            {term.pmpMindset ? <p className="mt-3 text-xs font-semibold leading-5 text-amber-100">{term.pmpMindset}</p> : null}
          </article>
        ))}
      </div>
    </div>
  );
}
