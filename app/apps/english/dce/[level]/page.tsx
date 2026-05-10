import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { countModuleQuestions, findLevel } from "@/lib/english/dce";

export const dynamic = "force-dynamic";

const BADGE_BG: Record<string, string> = {
  emerald: "bg-emerald-100 text-emerald-800",
  blue: "bg-blue-100 text-blue-800",
  violet: "bg-violet-100 text-violet-800",
};

type Params = Promise<{ level: string }>;

export default async function DceLevelPage({ params }: { params: Params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login");
  }

  const { level: levelId } = await params;
  const level = findLevel(levelId);
  if (!level) notFound();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef6ff_48%,#f8fafc_100%)] px-4 py-6 text-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <Link
            href="/apps/english/dce"
            className="text-sm font-semibold text-blue-700 hover:underline"
          >
            ← All DCE levels
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${BADGE_BG[level.badgeColor]}`}
            >
              {level.cefrRange}
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {level.name}
            </h1>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            {level.focus}. Each module ships with reading passages, listening
            scripts, vocabulary gap-fills, grammar drills, model dialogues, and
            an AI-powered roleplay with John.
          </p>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          {level.modules.map((module) => {
            const counts = countModuleQuestions(module);
            return (
              <article
                key={module.slug}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-200 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Module
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {module.topic}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {module.summary}
                  </p>
                </div>
                <div className="space-y-4 p-6">
                  <ContentRow label="Functional language" items={module.functionalLanguage} />
                  <ContentRow label="Vocabulary themes" items={module.vocabularyThemes} />
                  <ContentRow label="Grammar in context" items={module.grammarInContext} />

                  <div className="flex flex-wrap gap-2 pt-2 text-xs text-slate-600">
                    <Stat icon="📖" label={`${counts.reading} reading Q`} />
                    <Stat icon="🎧" label={`${counts.listening} listening Q`} />
                    <Stat icon="📝" label={`${counts.vocabulary} vocab`} />
                    <Stat icon="🧠" label={`${counts.grammar} grammar`} />
                    <Stat icon="🎭" label={`${module.roleplay.length} roleplay`} />
                  </div>

                  <Link
                    href={`/apps/english/dce/${level.level}/${module.slug}`}
                    className="inline-flex rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Open module →
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}

function ContentRow({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1">
      <span aria-hidden>{icon}</span>
      {label}
    </span>
  );
}
