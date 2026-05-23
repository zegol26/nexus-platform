"use client";

import { useState } from "react";

type BillingSettings = {
  lessonPriceCents: string;
  qrisInfo: string;
  bankInfo: string;
  midtransMode: string;
  midtransEnabled: string;
  promoCampaigns?: string;
};

export function MidtransPaymentControl({
  billingSettings,
  compact = false,
}: {
  billingSettings: BillingSettings;
  compact?: boolean;
}) {
  const [settings, setSettings] = useState(billingSettings);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [clickedAction, setClickedAction] = useState("");
  const enabled = settings.midtransEnabled === "true";
  const sandboxMode = settings.midtransMode !== "production";

  async function save(patch: Partial<BillingSettings>, action: string) {
    const next = { ...settings, ...patch };
    setSettings(next);
    setSaving(true);
    setClickedAction(action);
    setStatus("");

    const response = await fetch("/api/platform/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: next }),
    });
    const payload = await response.json().catch(() => ({}));
    setSaving(false);
    setTimeout(() => setClickedAction(""), 260);
    setStatus(response.ok ? "Payment control updated." : payload.error ?? "Update gagal.");
  }

  const buttonBase =
    "rounded-full px-4 py-2 text-sm font-bold transition duration-150 active:scale-95 disabled:opacity-60";

  return (
    <section className={compact ? "rounded-2xl border border-slate-200 bg-white p-4" : "rounded-2xl border border-slate-200 bg-white p-5"}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">Midtrans control</p>
          <h3 className="mt-1 font-semibold text-slate-950">
            {sandboxMode ? "Sandbox checkout" : "Production checkout"} is {enabled ? "open" : "closed"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Payment gate untuk maintenance, audit, atau freeze checkout. Saat closed,
            user tetap bisa lihat paket tapi tidak bisa lanjut bayar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => save({ midtransMode: sandboxMode ? "production" : "sandbox" }, "mode")}
            disabled={saving}
            className={`${buttonBase} border border-slate-300 bg-white text-slate-700 shadow-sm hover:border-blue-300 hover:bg-blue-50 ${
              clickedAction === "mode" ? "scale-95 ring-4 ring-blue-100" : ""
            }`}
          >
            {saving && clickedAction === "mode"
              ? "Switching..."
              : sandboxMode
                ? "Switch to production"
                : "Switch to sandbox"}
          </button>
          <button
            type="button"
            onClick={() => save({ midtransEnabled: enabled ? "false" : "true" }, "gate")}
            disabled={saving}
            className={`${buttonBase} text-white shadow-lg ${
              enabled
                ? "bg-rose-600 shadow-rose-600/20 hover:bg-rose-700"
                : "bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700"
            } ${clickedAction === "gate" ? "scale-95 ring-4 ring-slate-200" : ""}`}
          >
            {saving && clickedAction === "gate" ? "Updating..." : enabled ? "Pause checkout" : "Open checkout"}
          </button>
        </div>
      </div>
      {status ? <p className="mt-3 text-sm text-slate-600">{status}</p> : null}
    </section>
  );
}
