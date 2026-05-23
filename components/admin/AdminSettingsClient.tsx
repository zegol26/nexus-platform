"use client";

import { useState } from "react";
import { MidtransPaymentControl } from "@/components/admin/MidtransPaymentControl";

type Plan = {
  id: string;
  appName: string;
  name: string;
  code: string;
  priceCents: number;
  durationDays: number;
  billingPeriod: string;
  active: boolean;
};

type BillingSettings = {
  lessonPriceCents: string;
  qrisInfo: string;
  bankInfo: string;
  midtransMode: string;
  midtransEnabled: string;
  promoCampaigns?: string;
};

export function AdminSettingsClient({
  plans,
  billingSettings,
}: {
  plans: Plan[];
  billingSettings: BillingSettings;
}) {
  const [draftPlans, setDraftPlans] = useState(plans);
  const [settings, setSettings] = useState(billingSettings);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setStatus("");

    const response = await fetch("/api/platform/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plans: draftPlans.map((plan) => ({
          id: plan.id,
          priceCents: plan.priceCents,
          durationDays: plan.durationDays,
          billingPeriod: plan.billingPeriod,
          active: plan.active,
        })),
        settings,
      }),
    });
    const payload = await response.json();
    setSaving(false);
    setStatus(response.ok ? "Settings saved." : payload.error ?? "Settings belum bisa disimpan.");
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="font-semibold text-slate-950">Plan pricing</h3>
        <p className="mt-1 text-sm text-slate-500">Harga plan ini dipakai user billing dan invoice manual.</p>
        <div className="mt-4 grid gap-3">
          {draftPlans.map((plan, index) => (
            <div key={plan.id} className="grid gap-3 rounded-2xl bg-slate-50 p-4 lg:grid-cols-[1fr_150px_120px_140px_90px] lg:items-center">
              <div>
                <p className="font-semibold">{plan.appName} - {plan.name}</p>
                <p className="text-xs text-slate-500">{plan.code}</p>
              </div>
              <label className="text-xs font-semibold text-slate-500">
                Price cents
                <input
                  type="number"
                  min={0}
                  value={plan.priceCents}
                  onChange={(event) => updatePlan(index, { priceCents: Number(event.target.value) })}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm"
                />
              </label>
              <label className="text-xs font-semibold text-slate-500">
                Days
                <input
                  type="number"
                  min={1}
                  value={plan.durationDays}
                  onChange={(event) => updatePlan(index, { durationDays: Number(event.target.value) })}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm"
                />
              </label>
              <label className="text-xs font-semibold text-slate-500">
                Billing period
                <select
                  value={plan.billingPeriod}
                  onChange={(event) => updatePlan(index, { billingPeriod: event.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="YEARLY">Yearly</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={plan.active}
                  onChange={(event) => updatePlan(index, { active: event.target.checked })}
                />
                Active
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="font-semibold text-slate-950">Midtrans gateway</h3>
        <p className="mt-1 text-sm text-slate-500">
          Siapkan sandbox untuk validasi, lalu switch ke production saat akun live siap.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <label className="text-xs font-semibold text-slate-500">
            Mode
            <select
              value={settings.midtransMode}
              onChange={(event) => setSettings({ ...settings, midtransMode: event.target.value })}
              className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm"
            >
              <option value="sandbox">Sandbox</option>
              <option value="production">Production</option>
            </select>
          </label>
          <label className="flex items-center gap-2 pt-6 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={settings.midtransEnabled === "true"}
              onChange={(event) =>
                setSettings({ ...settings, midtransEnabled: event.target.checked ? "true" : "false" })
              }
            />
            Enable Midtrans checkout
          </label>
        </div>
      </section>

      <MidtransPaymentControl billingSettings={settings} />

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="font-semibold text-slate-950">Per-lesson pricing</h3>
        <p className="mt-1 text-sm text-slate-500">Disimpan sebagai setting, bukan hardcoded. Bisa dipakai untuk flow lesson purchase berikutnya.</p>
        <label className="mt-4 block max-w-xs text-xs font-semibold text-slate-500">
          Nihongo lesson price cents
          <input
            type="number"
            min={0}
            value={settings.lessonPriceCents}
            onChange={(event) => setSettings({ ...settings, lessonPriceCents: event.target.value })}
            className="mt-1 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm"
            placeholder="Belum diset"
          />
        </label>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:bg-slate-400"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
        {status ? <p className="text-sm text-slate-600">{status}</p> : null}
      </div>
    </div>
  );

  function updatePlan(index: number, patch: Partial<Plan>) {
    setDraftPlans((current) =>
      current.map((plan, planIndex) => (planIndex === index ? { ...plan, ...patch } : plan))
    );
  }
}
