import Link from "next/link";
import { LogIn, ShieldCheck, UserPlus } from "lucide-react";
import { MarketingFooter, MarketingNav } from "@/components/layout/MarketingChrome";
import { prisma } from "@/lib/db/prisma";
import { nexusContact } from "@/lib/nexus/marketing";

export const dynamic = "force-dynamic";

type CheckoutPlan = {
  id: string;
  name: string;
  billingPeriod: string;
  priceCents: number;
  currency: string;
  durationDays: number;
  app: {
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

function promoMoney(amountCents: number, currency: string) {
  return formatMoney(amountCents, currency);
}

function originalMoney(amountCents: number, currency: string) {
  return formatMoney(amountCents * 2, currency);
}

function loginHref(planId: string) {
  return `/login?callbackUrl=${encodeURIComponent(`/platform/billing?plan=${planId}`)}`;
}

function periodLabel(period: string, durationDays: number) {
  if (period === "MONTHLY") return "Monthly";
  if (period === "QUARTERLY") return "Quarterly";
  if (period === "YEARLY") return "Yearly";
  return `${durationDays} hari`;
}

export default async function CheckoutPage() {
  const plans = (await prisma.subscriptionPlan.findMany({
    where: {
      active: true,
      app: { status: "ACTIVE" },
    },
    include: { app: true },
    orderBy: [{ appId: "asc" }, { durationDays: "asc" }],
  })) as CheckoutPlan[];

  return (
    <div className="nexus-market-shell min-h-screen text-slate-950">
      <MarketingNav />
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
        <section className="min-w-0">
          <p className="font-extrabold text-blue-700">Order online</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950 sm:text-5xl">
            Pilih program Nexus Academy
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Halaman ini menampilkan produk/jasa yang ditawarkan, deskripsi layanan,
            harga, dan jalur order resmi untuk masuk ke platform pembelajaran.
          </p>
          <div className="mt-8 grid gap-5">
            {plans.length === 0 ? (
              <div className="nexus-card rounded-2xl p-5">
                <p className="font-black text-slate-950">Program belum tersedia.</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Admin perlu mengaktifkan minimal satu plan di Operations Console
                  sebelum order online bisa dipilih.
                </p>
              </div>
            ) : null}
            {plans.map((plan) => (
              <Link
                key={plan.id}
                href={loginHref(plan.id)}
                className="nexus-card block cursor-pointer rounded-2xl p-5 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-xl"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-black text-slate-950">{plan.app.name}</h2>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
                        Promo launch 50%
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{plan.app.description}</p>
                    <p className="mt-3 text-sm font-extrabold text-slate-500">
                      {periodLabel(plan.billingPeriod, plan.durationDays)} - Durasi akses: {plan.durationDays} hari
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-2xl font-black text-blue-700">{promoMoney(plan.priceCents, plan.currency)}</p>
                    <p className="text-sm text-slate-400 line-through">{originalMoney(plan.priceCents, plan.currency)}</p>
                  </div>
                  <span className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white">
                    Login untuk order
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <aside className="nexus-card h-fit min-w-0 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-600 p-3 text-white">
              <LogIn size={24} />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-500">Member checkout</p>
              <h2 className="text-2xl font-black text-slate-950">Login atau register</h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Order program diproses setelah akun aktif supaya akses belajar, invoice,
            dan durasi subscription tersimpan rapi di dashboard kamu.
          </p>
          <div className="mt-6 grid gap-3">
            <Link href="/login?callbackUrl=/platform/programs" className="nexus-primary w-full justify-center">
              Login untuk order <LogIn size={18} />
            </Link>
            <Link href="/register" className="nexus-secondary w-full justify-center">
              Register akun baru <UserPlus size={18} />
            </Link>
          </div>
          <div className="mt-5 rounded-2xl bg-green-50 p-4 text-sm leading-6 text-green-900">
            <ShieldCheck className="mb-2 text-green-700" size={22} />
            Setelah login, kamu bisa memilih program, melihat detail order,
            dan menyelesaikan pembayaran dari billing platform.
          </div>
          <p className="mt-5 text-xs leading-5 text-slate-500">
            Butuh bantuan? Hubungi {nexusContact.email} atau {nexusContact.phone}.
          </p>
        </aside>
      </main>
      <MarketingFooter />
    </div>
  );
}
