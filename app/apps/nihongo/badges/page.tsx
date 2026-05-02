import Link from "next/link";
import { getCurrentUserBadge } from "@/lib/nihongo/getCurrentUserBadge";
import { prisma } from "@/lib/db/prisma";

export default async function NihongoBadgesPage() {
  const [profile, badges] = await Promise.all([
    getCurrentUserBadge(),
    prisma.nihongoBadge.findMany({
      orderBy: { levelRequirement: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Nihongo Badges</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Identitas belajar kamu</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Badge ini original anime-inspired berdasarkan nilai belajar, bukan karakter atau aset resmi mana pun.
        </p>
      </section>

      {profile?.badge ? (
        <section className="rounded-3xl border border-cyan-200 bg-cyan-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-800">Badge aktif</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950">{profile.badge.nameIndonesian}</h2>
          <p className="mt-1 text-xl text-slate-700">{profile.badge.nameJapanese}</p>
          <p className="mt-3 text-sm leading-6 text-slate-700">{profile.badge.motivationalMessage}</p>
        </section>
      ) : (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Belum ada badge</h2>
          <p className="mt-2 text-sm text-slate-600">Selesaikan pre-assessment untuk membuka badge pertama.</p>
          <Link
            href="/apps/nihongo/pre-assessment"
            className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Mulai Pre-Assessment
          </Link>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        {badges.map((badge) => (
          <article key={badge.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-950">{badge.nameIndonesian}</p>
            <p className="mt-1 text-lg text-slate-700">{badge.nameJapanese}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">{badge.levelRequirement}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{badge.motivationalMessage}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
