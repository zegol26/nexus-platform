import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowRight, BadgeCheck, ShoppingCart, Sparkles } from "lucide-react";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

type ProgramPlan = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  priceCents: number;
  currency: string;
  durationDays: number;
  billingPeriod: string;
  app: {
    slug: string;
    name: string;
    description: string | null;
  };
};

function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}

function promoPrice(amountCents: number, currency: string) {
  return formatMoney(amountCents, currency);
}

function originalPrice(amountCents: number, currency: string) {
  return formatMoney(amountCents * 2, currency);
}

function periodLabel(period: string, days: number) {
  if (period === "MONTHLY") return "30 hari";
  if (period === "QUARTERLY") return "90 hari";
  if (period === "YEARLY") return "365 hari";
  return `${days} hari`;
}

export default async function PlatformProgramsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/platform/programs");
  }

  const plans = (await prisma.subscriptionPlan.findMany({
    where: {
      active: true,
      app: { status: "ACTIVE" },
    },
    include: { app: true },
    orderBy: [{ appId: "asc" }, { durationDays: "asc" }],
  })) as ProgramPlan[];

  const featuredPlans = plans.filter((plan) => plan.billingPeriod === "MONTHLY");

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl shadow-blue-950/10">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/15 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-sky-200">
              <Sparkles size={16} /> Promo launch 50%
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
              Pilih program Nexus sesuai apps yang benar-benar tersedia.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Harga dan paket di halaman ini ditarik dari data subscription plan platform:
              Nexus AI Nihongo, English, Arabic, dan PMP Exam Prep. Klik order untuk
              langsung masuk ke billing dengan paket yang dipilih.
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-white p-5 text-slate-950">
            <p className="text-sm font-black text-blue-700">Best monthly access</p>
            <div className="mt-4 grid gap-3">
              {featuredPlans.slice(0, 4).map((plan) => (
                <Link
                  href={`/platform/billing?plan=${plan.id}`}
                  key={plan.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-blue-300 hover:bg-blue-50"
                >
                  <div>
                    <p className="font-black">{plan.app.name}</p>
                    <p className="text-xs font-semibold text-slate-500">{periodLabel(plan.billingPeriod, plan.durationDays)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-blue-700">{promoPrice(plan.priceCents, plan.currency)}</p>
                    <p className="text-xs text-slate-400 line-through">{originalPrice(plan.priceCents, plan.currency)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {featuredPlans.map((plan) => (
          <article key={plan.id} className="rounded-[1.5rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-950/[0.04]">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
              Promo launch 50%
            </span>
            <h2 className="mt-5 text-2xl font-black text-slate-950">{plan.app.name}</h2>
            <p className="mt-3 min-h-24 text-sm leading-6 text-slate-600">
              {plan.app.description ?? plan.description}
            </p>
            <div className="mt-5">
              <p className="text-3xl font-black text-blue-700">{promoPrice(plan.priceCents, plan.currency)}</p>
              <p className="text-sm text-slate-400 line-through">{originalPrice(plan.priceCents, plan.currency)}</p>
              <p className="mt-1 text-sm font-bold text-slate-500">Akses {periodLabel(plan.billingPeriod, plan.durationDays)}</p>
            </div>
            <ul className="mt-5 grid gap-2 text-sm text-slate-700">
              {[
                "Akses aplikasi sesuai paket",
                "Progress belajar tersimpan",
                "Billing dan durasi akses terpantau",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <BadgeCheck className="mt-0.5 shrink-0 text-green-600" size={17} />
                  {item}
                </li>
              ))}
            </ul>
            <Link href={`/platform/billing?plan=${plan.id}`} className="mt-6 flex rounded-full bg-blue-600 px-5 py-3 text-center text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
              <span className="mx-auto inline-flex items-center gap-2">
                Order paket <ShoppingCart size={17} />
              </span>
            </Link>
          </article>
        ))}
      </section>

      <section className="rounded-[1.5rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-950/[0.04]">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-700">
              Semua opsi billing
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Monthly, quarterly, yearly</h2>
          </div>
          <Link href="/platform/billing" className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-5 py-3 text-sm font-black text-blue-700">
            Buka billing <ArrowRight size={17} />
          </Link>
        </div>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">App</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Durasi</th>
                <th className="px-4 py-3">Harga</th>
                <th className="px-4 py-3">Promo</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td className="px-4 py-3 font-bold text-slate-950">{plan.app.name}</td>
                  <td className="px-4 py-3 text-slate-600">{plan.name}</td>
                  <td className="px-4 py-3 text-slate-600">{periodLabel(plan.billingPeriod, plan.durationDays)}</td>
                  <td className="px-4 py-3 text-slate-500 line-through">{originalPrice(plan.priceCents, plan.currency)}</td>
                  <td className="px-4 py-3 font-black text-blue-700">{promoPrice(plan.priceCents, plan.currency)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/platform/billing?plan=${plan.id}`} className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white">
                      Order
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
