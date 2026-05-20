"use client";

import { useEffect, useState } from "react";

type BrainDump = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

const BRAIN_DUMP_TEMPLATES = [
  {
    title: "EVM Formulas",
    content:
      "PV = planned value\nEV = earned value\nAC = actual cost\nCV = EV - AC\nSV = EV - PV\nCPI = EV / AC\nSPI = EV / PV\nEAC = BAC / CPI\nETC = EAC - AC\nVAC = BAC - EAC\nTCPI (BAC target) = (BAC - EV) / (BAC - AC)\nTCPI (EAC target) = (BAC - EV) / (EAC - AC)",
    tags: ["evm", "cost", "math"],
  },
  {
    title: "Process Groups × Knowledge Areas (49 processes)",
    content:
      "Initiating: Develop Charter, Identify Stakeholders\nPlanning (24): Plan Scope/Schedule/Cost/Quality/Resource/Communications/Risk/Procurement/Stakeholder Mgmt, Collect Requirements, Define Scope, Create WBS, Define/Sequence Activities, Estimate Durations, Develop Schedule, Estimate Costs, Determine Budget, Estimate Activity Resources, Identify Risks, Perform Qualitative/Quantitative Risk Analysis, Plan Risk Responses, Develop PM Plan\nExecuting (10): Direct & Manage Work, Manage Knowledge, Manage Quality, Acquire/Develop/Manage Team, Manage Comms, Implement Risk Responses, Conduct Procurements, Manage Stakeholder Engagement\nM&C (12): Monitor & Control Work, ICC, Validate/Control Scope, Control Schedule/Costs/Quality/Resources/Comms/Risks/Procurements/Stakeholder Engagement\nClosing (1): Close Project or Phase",
    tags: ["pg-ka", "process"],
  },
  {
    title: "Risk Strategies (5+5)",
    content:
      "Threats: Avoid, Transfer, Mitigate, Accept, Escalate\nOpportunities: Exploit, Share, Enhance, Accept, Escalate\nEMV = Probability × Impact (sum across branches)\nSecondary risk = caused by response\nResidual risk = leftover after response\nContingency reserve = known unknowns (PM)\nManagement reserve = unknown unknowns (sponsor)",
    tags: ["risk"],
  },
  {
    title: "Conflict (Thomas-Kilmann) + Tuckman",
    content:
      "Thomas-Kilmann modes:\n- Collaborate (PMI default, win-win)\n- Compromise (lose-lose-ish, when time-boxed)\n- Accommodate (smooth over)\n- Avoid (postpone)\n- Force (emergency only)\n\nTuckman: Forming → Storming → Norming → Performing → Adjourning",
    tags: ["people", "conflict"],
  },
  {
    title: "Contract Types Quick Card",
    content:
      "FFP: scope sangat jelas → seller bear risk\nFPIF: target cost + incentive sharing\nFPEPA: fixed-price + economic adjustment (multi-year)\nT&M: hybrid, by hours\nCPFF: cost + fixed fee (no incentive)\nCPIF: cost + incentive fee\nCPAF: cost + award fee (subjective, no appeal)\n\nRFI = info\nRFQ = quote\nRFP = proposal\nIFB = sealed bid",
    tags: ["procurement", "contract"],
  },
];

export function PmpBrainDumps() {
  const [dumps, setDumps] = useState<BrainDump[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/apps/pmp/brain-dump");
      const data = await res.json();
      if (res.ok) setDumps(data.dumps ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/apps/pmp/brain-dump");
        if (cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) setDumps(data.dumps ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function reset() {
    setEditingId(null);
    setTitle("");
    setContent("");
    setTags("");
    setError("");
  }

  function loadTemplate(template: (typeof BRAIN_DUMP_TEMPLATES)[number]) {
    setEditingId(null);
    setTitle(template.title);
    setContent(template.content);
    setTags(template.tags.join(", "));
  }

  function loadForEdit(dump: BrainDump) {
    setEditingId(dump.id);
    setTitle(dump.title);
    setContent(dump.content);
    setTags(dump.tags.join(", "));
  }

  async function save() {
    if (!content.trim()) {
      setError("Content tidak boleh kosong");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const parsedTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const payload = {
        title: title.trim() || "Brain dump",
        content: content.trim(),
        tags: parsedTags,
        ...(editingId ? { id: editingId } : {}),
      };
      const res = await fetch("/api/apps/pmp/brain-dump", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan");
      reset();
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Hapus brain dump ini?")) return;
    const res = await fetch(`/api/apps/pmp/brain-dump?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      if (editingId === id) reset();
      load();
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.55fr_1fr]">
      <div className="space-y-5">
        <div className="rounded-2xl border border-violet-300/15 bg-gradient-to-br from-violet-950/40 via-slate-950 to-cyan-950/30 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-fuchsia-200">
            Brain Dump ✦
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Tuangkan semua yang kamu hafal di sini.
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Brain dump = tulis ulang formula, process group, KA grid, strategy, dan terms penting
            tanpa lihat referensi. Latihan paling efektif untuk &ldquo;5 menit pertama&rdquo; di
            exam — saat kamu dump everything to scratch paper sebelum mulai soal.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            Template cepat
          </p>
          <div className="mt-3 grid gap-2">
            {BRAIN_DUMP_TEMPLATES.map((tpl) => (
              <button
                key={tpl.title}
                onClick={() => loadTemplate(tpl)}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-xs leading-5 text-slate-300 transition hover:border-fuchsia-300/40 hover:bg-white/[0.07]"
              >
                <p className="font-semibold text-white">{tpl.title}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">{tpl.tags.join(" · ")}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
              {editingId ? "Edit brain dump" : "Brain dump baru"}
            </p>
            {editingId && (
              <button
                onClick={reset}
                className="text-[11px] font-bold text-slate-400 hover:text-white"
              >
                Batal
              </button>
            )}
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul (mis. EVM formulas)"
            className="mt-3 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none ring-fuchsia-300/40 focus:ring-2"
            maxLength={200}
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tulis semua yang kamu ingat — formula, akronim, strategy, urutan process..."
            rows={10}
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 font-mono text-xs leading-6 text-white outline-none ring-fuchsia-300/40 focus:ring-2"
            maxLength={20000}
          />
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma-separated): evm, risk, procurement..."
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-white outline-none ring-fuchsia-300/40 focus:ring-2"
          />
          {error && <p className="mt-2 text-xs font-semibold text-rose-300">{error}</p>}
          <button
            onClick={save}
            disabled={saving || !content.trim()}
            className="mt-3 w-full rounded-lg bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : editingId ? "Update" : "Simpan brain dump"}
          </button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <p className="text-sm text-slate-400">Memuat brain dumps...</p>
          ) : dumps.length === 0 ? (
            <p className="text-sm text-slate-400">
              Belum ada brain dump. Mulai dari template di sebelah kiri atau tulis dari nol.
            </p>
          ) : (
            dumps.map((dump) => (
              <article
                key={dump.id}
                className="rounded-2xl border border-white/10 bg-slate-900 p-4"
              >
                <header className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">{dump.title}</h3>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Last updated {new Date(dump.updatedAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => loadForEdit(dump)}
                      className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-bold text-slate-200 hover:bg-white/10"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(dump.id)}
                      className="rounded-md border border-rose-300/30 bg-rose-300/10 px-2 py-1 text-[11px] font-bold text-rose-200 hover:bg-rose-300/20"
                    >
                      Hapus
                    </button>
                  </div>
                </header>
                {dump.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {dump.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-fuchsia-300/10 px-2 py-0.5 text-[10px] font-bold text-fuchsia-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-black/30 p-3 font-mono text-[11px] leading-5 text-slate-200">
                  {dump.content}
                </pre>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
