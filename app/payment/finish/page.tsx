import Link from "next/link";
import { CheckCircle2, Clock3, Home, LayoutDashboard } from "lucide-react";
import { MarketingFooter, MarketingNav } from "@/components/layout/MarketingChrome";

export default async function PaymentFinishPage({
  searchParams,
}: {
  searchParams?: Promise<{ order_id?: string; transaction_status?: string; status_code?: string }>;
}) {
  const params = await searchParams;
  const orderId = params?.order_id ?? "";
  const status = params?.transaction_status ?? "";

  return (
    <div className="nexus-market-shell min-h-screen text-slate-950">
      <MarketingNav />
      <main className="mx-auto grid min-h-[70vh] max-w-4xl place-items-center px-4 py-14 sm:px-6 lg:px-8">
        <section className="w-full rounded-3xl border border-blue-100 bg-white p-6 shadow-xl shadow-blue-950/[0.06] sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
              <CheckCircle2 size={30} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-blue-700">
                Payment return
              </p>
              <h1 className="mt-2 text-3xl font-black text-slate-950">
                Pembayaran sedang diproses
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Terima kasih. Status akses akan diperbarui setelah notifikasi
                resmi dari payment gateway diterima oleh Nexus Talenta Indonesia
                Academy.
              </p>

              <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <p className="flex items-center gap-2 font-semibold text-slate-950">
                  <Clock3 size={18} /> Ringkasan transaksi
                </p>
                <p>Order ID: {orderId || "Menunggu data gateway"}</p>
                <p>Status gateway: {status || "Dalam proses"}</p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/platform/billing" className="nexus-primary">
                  <LayoutDashboard size={18} /> Lihat billing
                </Link>
                <Link href="/platform/dashboard" className="nexus-secondary">
                  Buka dashboard
                </Link>
                <Link href="/" className="nexus-secondary">
                  <Home size={18} /> Academy Home
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
