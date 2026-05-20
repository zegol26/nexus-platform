import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function PmpKnowledgeBasePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const category = typeof params.category === "string" ? params.category : "";
  const examVersion = typeof params.examVersion === "string" ? params.examVersion : "";

  const articles = await prisma.pmpKnowledgeArticle.findMany({
    where: {
      isActive: true,
      ...(category ? { category } : {}),
      ...(examVersion ? { examVersion } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { summary: { contains: q, mode: "insensitive" } },
              { content: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { title: "asc" },
  });

  const categories = await prisma.pmpKnowledgeArticle.findMany({
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">PMBOK Knowledge Base</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Mindset, Process, Knowledge Area, Agile, Hybrid, AI, Sustainability</h1>
      </section>

      <form className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900 p-4 md:grid-cols-3">
        <input name="q" defaultValue={q} placeholder="Search article" className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white" />
        <select name="category" defaultValue={category} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white">
          <option value="">All categories</option>
          {categories.map((item) => <option key={item.category}>{item.category}</option>)}
        </select>
        <select name="examVersion" defaultValue={examVersion} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white">
          <option value="">All exam versions</option>
          <option value="current">Current</option>
          <option value="2026">2026</option>
          <option value="both">Both</option>
        </select>
        <button className="rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 md:col-span-3">Apply Filters</button>
      </form>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {articles.map((article) => (
          <Link key={article.id} href={`/apps/pmp/knowledge-base/${article.slug}`} className="rounded-2xl border border-white/10 bg-slate-900 p-5 transition hover:border-cyan-300/60">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{article.category} / {article.examVersion}</p>
            <h2 className="mt-3 text-xl font-semibold text-white">{article.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{article.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
