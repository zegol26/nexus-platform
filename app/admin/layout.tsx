import Link from "next/link";
import { notFound } from "next/navigation";
import { IdleLogout } from "@/components/platform/IdleLogout";
import { requireAdmin } from "@/lib/auth/require-admin";

const adminLinks = [
  ["Users", "/admin/users"],
  ["Subscriptions", "/admin/subscriptions"],
  ["Payments", "/admin/payments"],
  ["Usage", "/admin/usage"],
  ["Lessons", "/admin/lessons"],
  ["Lesson Cache", "/admin/lesson-cache"],
  ["Readings", "/admin/readings"],
  ["Listening Manager", "/admin/listening"],
  ["Flashcards", "/admin/flashcards"],
  ["Quizzes", "/admin/quizzes"],
  ["Recordings", "/admin/recordings"],
  ["PMP Analytics", "/admin/apps/pmp/analytics"],
  ["PMP ITTO", "/admin/apps/pmp/itto"],
  ["PMP Glossary", "/admin/apps/pmp/glossary"],
  ["PMP Knowledge", "/admin/apps/pmp/knowledge-base"],
  ["StoryArc Content", "/admin/apps/storyarc/content"],
  ["Settings", "/admin/settings"],
  ["Architecture", "/admin/architecture"],
];

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) notFound();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="border-b border-slate-200 bg-white px-4 py-4 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href="/platform/admin" className="text-sm font-semibold text-blue-700">
              Nexus Admin
            </Link>
            <h1 className="mt-1 text-2xl font-semibold">Operations Console</h1>
          </div>
          <Link href="/platform/dashboard" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold">
            Back to Platform
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3">
          <nav className="grid gap-1">
            {adminLinks.map(([label, href]) => (
              <Link key={href} href={href} className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-950">
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <main>{children}</main>
      </div>
      <IdleLogout />
    </div>
  );
}
