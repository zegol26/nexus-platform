import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { curriculumStats, dceCurriculum } from "@/lib/english/dce";
import { JohnAvatar } from "@/components/apps/english/john/JohnAvatar";

export const dynamic = "force-dynamic";

// Static class lookup so Tailwind JIT can see the literal class names.
const BADGE_TEXT: Record<string, string> = {
  emerald: "text-emerald-700",
  blue: "text-blue-700",
  violet: "text-violet-700",
};

export default async function EnglishHubPage() {
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
            Nexus AI English
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Your English learning hub
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Three pillars of your English journey — interview practice, the
            structured CEFR curriculum, and live conversation with John, your
            AI coach.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/platform/dashboard"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Back to Platform
            </Link>
            <Link
              href="/apps/english/dce"
              className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Open DCE Curriculum
            </Link>
            <Link
              href="/apps/english/john"
              className="rounded-full bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Talk with John
            </Link>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <FeatureCard
            tag="Interview Prep"
            title="Overseas Job Interview Practice"
            description="Listen to interview prompts in clear English and submit a recording for manual review by admin or sensei."
            href="/apps/english/interview"
            cta="Start Interview Practice"
            accent="from-slate-900 via-blue-900 to-slate-700"
          />
          <FeatureCard
            tag="DCE · CEFR A1 → C1"
            title="Dynamic Conversational English"
            description={`A structured CEFR curriculum across ${stats.totalLevels} levels and ${stats.totalModules} modules. ${stats.totalQuestions}+ questions across reading, listening, vocabulary, grammar, dialogue, and roleplay.`}
            href="/apps/english/dce"
            cta="Browse Curriculum"
            accent="from-emerald-700 via-blue-700 to-violet-700"
          />
          <FeatureCard
            tag="John · AI Coach"
            title="Conversation with John"
            description="40-something male English coach. Free chat or scenario-based roleplays — text or push-to-talk voice."
            href="/apps/english/john"
            cta="Open Conversation"
            accent="from-blue-800 via-slate-700 to-blue-900"
            avatar
          />
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            DCE Levels
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Pick a level to start
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {dceCurriculum.map((level) => (
              <Link
                key={level.level}
                href={`/apps/english/dce/${level.level}`}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:border-blue-300 hover:bg-white"
              >
                <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${BADGE_TEXT[level.badgeColor]}`}>
                  {level.cefrRange}
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {level.name}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {level.focus}
                </p>
                <p className="mt-3 text-xs font-medium text-blue-700 group-hover:underline">
                  {level.modules.length} modules →
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({
  tag,
  title,
  description,
  href,
  cta,
  accent,
  avatar,
}: {
  tag: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  accent: string;
  avatar?: boolean;
}) {
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className={`bg-gradient-to-br ${accent} p-6 text-white`}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
          {tag}
        </p>
        <h3 className="mt-3 text-2xl font-semibold leading-tight">{title}</h3>
        {avatar && (
          <div className="mt-4">
            <JohnAvatar size={56} />
          </div>
        )}
      </div>
      <div className="space-y-4 p-6">
        <p className="text-sm leading-6 text-slate-600">{description}</p>
        <Link
          href={href}
          className="inline-flex rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          {cta}
        </Link>
      </div>
    </article>
  );
}
