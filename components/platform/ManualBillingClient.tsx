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

type BillingSettings = {
  qrisInfo: string;
  bankInfo: string;
  lessonPriceCents: string;
  midtransMode: string;
  midtransEnabled: string;
};

export function ManualBillingClient({
  plans,
  latestPayment,
  billingSettings,
}: {
  plans: Plan[];
  latestPayment?: Payment | null;
  billingSettings: BillingSettings;
}) {
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [method, setMethod] = useState("BANK_TRANSFER");
  const [paymentId, setPaymentId] = useState(latestPayment?.id ?? "");
  const [proof, setProof] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function createInvoice() {
    if (!planId) return;
    setLoading(true);
    setStatus("");

    const response = await fetch("/api/platform/billing/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, method }),
    });
    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setStatus(payload.error ?? "Invoice belum bisa dibuat.");
      return;
    }

    setPaymentId(payload.payment.id);
    if (payload.midtrans?.redirectUrl) {
      setStatus("Midtrans checkout dibuat. Buka halaman pembayaran sandbox untuk UAT.");
      window.open(payload.midtrans.redirectUrl, "_blank", "noopener,noreferrer");
      return;
    }
    setStatus("Invoice dibuat. Upload bukti pembayaran untuk verifikasi admin.");
  }

  const paymentInfo = method === "QRIS" ? billingSettings.qrisInfo : billingSettings.bankInfo;
  const midtransActive = billingSettings.midtransEnabled === "true";

  async function uploadProof() {
    if (!paymentId || !proof) {
      setStatus("Pilih invoice dan file bukti dulu.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("proof", proof);

      const response = await fetch(
        `/api/platform/billing/payments/${paymentId}/proof`,
        {
          method: "POST",
          body: formData,
        }
      );

      // Server may return non-JSON (HTML 500 page from a runtime error).
      // Read the body as text first so a parse failure doesn't leave the
      // spinner stuck.
      const raw = await response.text();
      let payload: { error?: string } = {};
      try {
        payload = raw ? (JSON.parse(raw) as { error?: string }) : {};
      } catch {
        payload = { error: raw.slice(0, 200) || "Upload gagal." };
      }

      if (response.ok) {
        setStatus(
          "Bukti pembayaran terkirim. Status menunggu verifikasi admin."
        );
      } else {
        setStatus(payload.error ?? `Upload gagal (HTTP ${response.status}).`);
      }
    } catch (error) {
      setStatus(
        error instanceof Error
          ? `Upload gagal: ${error.message}`
          : "Upload gagal: jaringan bermasalah."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-cyan-200 bg-cyan-50 p-6 shadow-xl shadow-cyan-950/[0.04]">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Payment UAT</p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">Midtrans sandbox / QRIS / bank transfer</h2>
      <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_180px_auto]">
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
        <select
          value={method}
          onChange={(event) => setMethod(event.target.value)}
          className="h-11 rounded-full border border-cyan-200 bg-white px-4 text-sm font-medium"
        >
          <option value="BANK_TRANSFER">Bank Transfer</option>
          <option value="QRIS">QRIS</option>
          <option value="MIDTRANS" disabled={!midtransActive}>
            Midtrans {billingSettings.midtransMode === "production" ? "Production" : "Sandbox"}
            {midtransActive ? "" : " (disabled)"}
          </option>
        </select>
        <button
          type="button"
          onClick={createInvoice}
          disabled={loading || !planId}
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:bg-slate-400"
        >
          Create Invoice
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-cyan-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-950">
          {method === "MIDTRANS"
            ? "Midtrans checkout"
            : method === "QRIS"
              ? "QRIS info"
              : "Bank account information"}
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
          {method === "MIDTRANS"
            ? `Mode: ${billingSettings.midtransMode}. Checkout akan membuka Snap redirect URL setelah invoice dibuat.`
            : paymentInfo.trim() || "Belum diset oleh admin."}
        </p>
        {billingSettings.lessonPriceCents ? (
          <p className="mt-3 text-xs font-semibold text-slate-500">
            Lesson price setting: {new Intl.NumberFormat("id-ID").format(Number(billingSettings.lessonPriceCents) / 100)} IDR
          </p>
        ) : null}
      </div>

      {method !== "MIDTRANS" ? (
      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={(event) => setProof(event.target.files?.[0] ?? null)}
          className="rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm"
        />
        <button
          type="button"
          onClick={uploadProof}
          disabled={loading || !paymentId || !proof}
          className="rounded-full bg-cyan-700 px-5 py-3 text-sm font-semibold text-white disabled:bg-slate-400"
        >
          Upload Proof
        </button>
      </div>
      ) : null}

      {paymentId ? <p className="mt-3 text-xs text-slate-600">Active invoice: {paymentId}</p> : null}
      {status ? <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm text-slate-700">{status}</p> : null}
    </section>
  );
}
