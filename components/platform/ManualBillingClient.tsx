"use client";

import { useState } from "react";

type Plan = {
  id: string;
  name: string;
  code: string;
  priceCents: number;
  currency: string;
  durationDays: number;
  billingPeriod: string;
  app: {
    name: string;
  };
};

type Payment = {
  id: string;
  status: string;
};

type PaymentOption = {
  mode: string;
  label: string;
  description: string;
  enabled: boolean;
};

export function ManualBillingClient({
  plans,
  latestPayment,
  paymentOptions,
  initialPlanId,
}: {
  plans: Plan[];
  latestPayment?: Payment | null;
  paymentOptions: PaymentOption[];
  initialPlanId?: string;
}) {
  const [planId, setPlanId] = useState(
    initialPlanId && plans.some((plan) => plan.id === initialPlanId)
      ? initialPlanId
      : plans[0]?.id ?? ""
  );
  const [paymentId, setPaymentId] = useState(latestPayment?.id ?? "");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const selectedPlan = plans.find((plan) => plan.id === planId);
  const availablePaymentOptions = paymentOptions.filter((option) => option.enabled);

  async function createInvoice(mode: string) {
    if (!planId) return;
    setLoading(true);
    setStatus("");

    const response = await fetch("/api/platform/billing/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, method: "MIDTRANS", mode }),
    });
    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setStatus(payload.error ?? "Invoice belum bisa dibuat.");
      return;
    }

    setPaymentId(payload.payment.id);
    if (payload.midtrans?.redirectUrl) {
      setStatus("Checkout siap. Kamu akan diarahkan ke halaman pembayaran aman.");
      window.location.href = payload.midtrans.redirectUrl;
      return;
    }
    setStatus("Invoice dibuat. Lanjutkan pembayaran dari halaman checkout.");
  }

  return (
    <section className="rounded-[2rem] border border-cyan-200 bg-cyan-50 p-6 shadow-xl shadow-cyan-950/[0.04]">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Pembayaran</p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">Checkout pembayaran aman</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        Pilih program, lalu lanjutkan pembayaran melalui kanal resmi. QRIS,
        virtual account, e-wallet, dan gerai retail tersedia di halaman checkout.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {["QRIS", "Virtual Account", "E-Wallet", "Gerai Retail"].map((label) => (
          <span key={label} className="rounded-full border border-cyan-200 bg-white px-3 py-1 text-xs font-bold text-slate-700">
            {label}
          </span>
        ))}
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
        <select
          value={planId}
          onChange={(event) => setPlanId(event.target.value)}
          className="h-11 rounded-full border border-cyan-200 bg-white px-4 text-sm font-medium"
        >
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.app.name} - {plan.name} - {new Intl.NumberFormat("id-ID").format(plan.priceCents / 100)} {plan.currency}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap gap-2">
          {availablePaymentOptions.map((option) => (
            <button
              key={option.mode}
              type="button"
              onClick={() => createInvoice(option.mode)}
              disabled={loading || !planId}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:bg-slate-400"
              title={option.description}
            >
              {loading ? "Menyiapkan..." : option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-cyan-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-950">Ringkasan order</p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
          {selectedPlan
            ? `${selectedPlan.app.name} - ${selectedPlan.name} - ${new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: selectedPlan.currency,
                maximumFractionDigits: 0,
              }).format(selectedPlan.priceCents / 100)}`
            : "Pilih program terlebih dahulu."}
        </p>
        {availablePaymentOptions.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            Pembayaran online sedang ditutup sementara oleh admin.
          </p>
        ) : null}
      </div>

      {paymentId ? <p className="mt-3 text-xs text-slate-600">Nomor invoice: {paymentId}</p> : null}
      {status ? <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm text-slate-700">{status}</p> : null}
    </section>
  );
}
