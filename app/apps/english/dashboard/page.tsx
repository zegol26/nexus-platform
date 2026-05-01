import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

export default async function EnglishDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_34%,#fff7ed_72%,#f8fafc_100%)] px-6 py-8 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center">
        <section className="w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/82 shadow-2xl shadow-slate-950/[0.06] backdrop-blur-2xl">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-7 sm:p-10">
              <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
                Coming soon
              </span>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950">
                Nexus AI English
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">
                English learning workspace for speaking practice, grammar drills,
                workplace phrases, and progress tracking. This app shell is ready,
                but access will be opened after the lesson engine is connected.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/platform/dashboard"
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Back to Platform
                </Link>
                <Link
                  href="/platform/apps"
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  View Apps
                </Link>
              </div>
            </div>

            <div className="bg-slate-950 p-7 text-white sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
                Planned modules
              </p>
              <div className="mt-6 grid gap-3">
                {["Daily speaking", "Grammar coach", "Workplace English", "AI pronunciation review"].map(
                  (item) => (
                    <div key={item} className="rounded-2xl bg-white/10 p-4">
                      <p className="font-semibold">{item}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
