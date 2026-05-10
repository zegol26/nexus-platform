import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import {
  countModuleQuestions,
  curriculumStats,
  dceCurriculum,
} from "@/lib/english/dce";

export const dynamic = "force-dynamic";

const BADGE_BG: Record<string, string> = {
  emerald: "bg-emerald-100 text-emerald-800",
  blue: "bg-blue-100 text-blue-800",
  violet: "bg-violet-100 text-violet-800",
};

const RING: Record<string, string> = {
  emerald: "ring-emerald-200",
  blue: "ring-blue-200",
  violet: "ring-violet-200",
};

export default async function DceOverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login");
  }

  const stats = curriculumStats();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef6ff_48%,#f8fafc_100%)] px-4 py-6 text-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">
            Dynamic Conversational English · CEFR
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Three levels. {stats.totalModules} modules. {stats.totalQuestions}+ questions.
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Designed by Cambridge-style curriculum mapping for Nexus Platform.
            Each module is built around real functional language, vocabulary
            themes, and grammar in context — plus reading, listening, drills,
            and AI roleplay with John.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/apps/english/dashboard"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              ← English Hub
            </Link>
            <Link
              href="/apps/english/john"
              className="rounded-full bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Talk with John
            </Link>
          </div>
        </section>

        <section className="space-y-6">
          {dceCurriculum.map((level) => (
            <article
              key={level.level}
              className={`overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm ring-1 ${RING[level.badgeColor]}`}
            >
              <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
                <div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${BADGE_BG[level.badgeColor]}`}
                  >
                    {level.cefrRange}
                  </span>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                    {level.name}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    {level.focus}
                  </p>
                </div>
                <Link
                  href={`/apps/english/dce/${level.level}`}
                  className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Open level
                </Link>
              </div>

              <ul className="grid gap-3 p-6 sm:grid-cols-2 sm:p-8">
                {level.modules.map((module) => {
                  const counts = countModuleQuestions(module);
                  return (
                    <li key={module.slug}>
                      <Link
                        href={`/apps/english/dce/${level.level}/${module.slug}`}
                        className="group block rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white"
                      >
                        <p className="text-base font-semibold text-slate-950">
                          {module.topic}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {module.summary}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                          <span>📖 {counts.reading} reading Q</span>
                          <span>🎧 {counts.listening} listening Q</span>
                          <span>📝 {counts.vocabulary} vocab</span>
                          <span>🧠 {counts.grammar} grammar</span>
                          <span>🎭 {module.roleplay.length} roleplay</span>
                        </div>
                        <p className="mt-3 text-xs font-medium text-blue-700 group-hover:underline">
                          Open module →
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
