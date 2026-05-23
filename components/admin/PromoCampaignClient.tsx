"use client";

import { useMemo, useState } from "react";
import { Copy, Plus, Save, Send, Trash2 } from "lucide-react";

export type PromoCampaign = {
  code: string;
  title: string;
  discount: string;
  audience: string;
  status: string;
  message: string;
};

type BillingSettings = {
  lessonPriceCents: string;
  qrisInfo: string;
  bankInfo: string;
  midtransMode: string;
  midtransEnabled: string;
  promoCampaigns?: string;
};

const blankPromo: PromoCampaign = {
  code: "NEXUSLAUNCH",
  title: "Launch campaign",
  discount: "50%",
  audience: "New learners",
  status: "Draft",
  message: "Promo launch Nexus Talenta Indonesia Academy untuk akses belajar AI.",
};

export function PromoCampaignClient({
  initialPromos,
  billingSettings,
}: {
  initialPromos: PromoCampaign[];
  billingSettings: BillingSettings;
}) {
  const [promos, setPromos] = useState(initialPromos.length ? initialPromos : [blankPromo]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const selectedPromo = promos[selectedIndex] ?? promos[0] ?? blankPromo;

  const stats = useMemo(() => {
    const active = promos.filter((promo) => promo.status.toLowerCase() === "active").length;
    const maxDiscount = promos.reduce((max, promo) => {
      const number = Number.parseInt(promo.discount.replace(/\D/g, ""), 10);
      return Number.isFinite(number) ? Math.max(max, number) : max;
    }, 0);
    return { active, total: promos.length, maxDiscount };
  }, [promos]);

  function updateSelected(patch: Partial<PromoCampaign>) {
    setPromos((current) =>
      current.map((promo, index) => (index === selectedIndex ? { ...promo, ...patch } : promo))
    );
  }

  function addPromo() {
    setPromos((current) => [...current, { ...blankPromo, code: `NEXUS${current.length + 1}` }]);
    setSelectedIndex(promos.length);
    setStatus("");
  }

  function duplicatePromo() {
    setPromos((current) => [
      ...current,
      { ...selectedPromo, code: `${selectedPromo.code}-COPY`, status: "Draft" },
    ]);
    setSelectedIndex(promos.length);
    setStatus("");
  }

  function deletePromo() {
    if (promos.length === 1) return;
    setPromos((current) => current.filter((_, index) => index !== selectedIndex));
    setSelectedIndex(0);
    setStatus("");
  }

  async function savePromos(nextPromos = promos) {
    setSaving(true);
    setStatus("");
    const response = await fetch("/api/platform/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        settings: {
          ...billingSettings,
          promoCampaigns: JSON.stringify(nextPromos),
        },
      }),
    });
    const payload = await response.json().catch(() => ({}));
    setSaving(false);
    setStatus(response.ok ? "Promo campaign saved." : payload.error ?? "Promo gagal disimpan.");
  }

  async function publishSelected() {
    const next = promos.map((promo, index) =>
      index === selectedIndex ? { ...promo, status: "Active" } : promo
    );
    setPromos(next);
    await savePromos(next);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="rounded-[28px] bg-white p-6 shadow-sm">
        <p className="font-extrabold text-blue-700">Admin UI</p>
        <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">Promo campaign</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Buat campaign yang bisa diedit, disimpan, dipublish, atau dipakai ulang untuk halaman publik dan dashboard.
            </p>
          </div>
          <button className="nexus-primary" type="button" onClick={addPromo}>
            <Plus size={18} /> Promo baru
          </button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          [String(stats.total), "Campaign"],
          [`${stats.maxDiscount}%`, "Diskon tertinggi"],
          [String(stats.active), "Campaign aktif"],
        ].map(([value, label]) => (
          <div key={label} className="nexus-card rounded-2xl p-5">
            <p className="text-3xl font-black text-slate-950">{value}</p>
            <p className="text-sm font-semibold text-slate-500">{label}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="nexus-card overflow-hidden rounded-2xl">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-2xl font-black text-slate-950">Daftar promo</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-4">Kode</th>
                  <th className="px-4 py-4">Campaign</th>
                  <th className="px-4 py-4">Diskon</th>
                  <th className="px-4 py-4">Audience</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {promos.map((promo, index) => (
                  <tr key={`${promo.code}-${index}`} className={index === selectedIndex ? "bg-blue-50" : "bg-white"}>
                    <td className="px-4 py-4 font-mono font-black text-blue-700">{promo.code}</td>
                    <td className="px-4 py-4 font-bold text-slate-900">{promo.title}</td>
                    <td className="px-4 py-4 text-slate-600">{promo.discount}</td>
                    <td className="px-4 py-4 text-slate-600">{promo.audience}</td>
                    <td className="px-4 py-4">
                      <span className="whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-black text-blue-700">
                        {promo.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedIndex(index)}
                        className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold text-slate-700"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="nexus-card h-fit rounded-2xl p-6">
          <h2 className="text-2xl font-black text-slate-950">Composer</h2>
          <form className="mt-5 grid gap-4">
            <input className="nexus-field" value={selectedPromo.code} onChange={(event) => updateSelected({ code: event.target.value })} aria-label="Kode promo" />
            <input className="nexus-field" value={selectedPromo.title} onChange={(event) => updateSelected({ title: event.target.value })} aria-label="Campaign title" />
            <input className="nexus-field" value={selectedPromo.discount} onChange={(event) => updateSelected({ discount: event.target.value })} aria-label="Diskon" />
            <input className="nexus-field" value={selectedPromo.audience} onChange={(event) => updateSelected({ audience: event.target.value })} aria-label="Audience" />
            <select className="nexus-field" value={selectedPromo.status} onChange={(event) => updateSelected({ status: event.target.value })}>
              <option>Draft</option>
              <option>Active</option>
              <option>Paused</option>
              <option>Archived</option>
            </select>
            <textarea
              className="nexus-field min-h-28"
              value={selectedPromo.message}
              onChange={(event) => updateSelected({ message: event.target.value })}
              aria-label="Promo message"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" className="nexus-primary justify-center" onClick={() => savePromos()} disabled={saving}>
                <Save size={18} /> Save
              </button>
              <button type="button" className="nexus-secondary justify-center" onClick={publishSelected} disabled={saving}>
                Publish <Send size={18} />
              </button>
              <button type="button" className="nexus-secondary justify-center" onClick={duplicatePromo}>
                <Copy size={18} /> Reuse
              </button>
              <button type="button" className="rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-bold text-rose-700" onClick={deletePromo}>
                <Trash2 size={18} className="inline" /> Delete
              </button>
            </div>
            {status ? <p className="text-sm text-slate-600">{status}</p> : null}
          </form>
        </aside>
      </section>
    </div>
  );
}
