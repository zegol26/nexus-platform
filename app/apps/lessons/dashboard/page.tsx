import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

export default async function LessonsDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#ecfeff_0,#f8fafc_36%,#eef2ff_72%,#f8fafc_100%)] px-6 py-8 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center">
        <section className="w-full rounded-[2rem] border border-white/70 bg-white/82 p-7 shadow-2xl shadow-slate-950/[0.06] backdrop-blur-2xl sm:p-10">
          <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-700">
            Lesson engine
          </span>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
                Nexus Lessons
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                Reusable lesson workspace for future Nexus apps. This will power
                app-specific lessons, access rules, quizzes, flashcards, and
                payment-based expiry across multiple subjects.
              </p>
            </div>
            <div className="grid gap-3">
              <Link
                href="/platform/dashboard"
                className="rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-cyan-700"
              >
                Back to Platform
              </Link>
              <Link
                href="/platform/admin"
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                Admin Access
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
