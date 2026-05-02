import Link from "next/link";

const nihongoMenu = [
  { label: "Dashboard", href: "/apps/nihongo/dashboard", marker: "01" },
  { label: "Pre-assessment", href: "/apps/nihongo/pre-assessment", marker: "02" },
  { label: "Curriculum", href: "/apps/nihongo/curriculum", marker: "03" },
  { label: "Flashcards", href: "/apps/nihongo/flashcards", marker: "04" },
  { label: "AI Tutor", href: "/apps/nihongo/tutor", marker: "05" },
  { label: "Quiz", href: "/apps/nihongo/quiz", marker: "06" },
  { label: "Reading", href: "/apps/nihongo/reading", marker: "07" },
  { label: "JLPT N5 Mock", href: "/apps/nihongo/mock-test/n5", marker: "08" },
];

export function NihongoSidebar() {
  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-slate-200 bg-white/90 px-5 py-6 shadow-sm backdrop-blur lg:block">
      <Link
        href="/platform/dashboard"
        className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400"
      >
        Nexus Platform
      </Link>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white">
        <div className="mb-4 flex items-center justify-center rounded-xl bg-white p-3">
          <img
            src="/nexus-ai-logo.png"
            alt="Nexus AI"
            className="h-24 w-auto object-contain"
          />
        </div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
          AI Language Lab
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">
          Nexus AI Nihongo
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          JLPT, JFT, flashcards, and tutor practice in one learning cockpit.
        </p>
      </div>

      <nav className="mt-6 space-y-1">
        {nihongoMenu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-cyan-50 hover:text-slate-950"
          >
            <span className="flex h-7 w-9 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-bold text-slate-500 transition group-hover:bg-cyan-100 group-hover:text-cyan-700">
              {item.marker}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
