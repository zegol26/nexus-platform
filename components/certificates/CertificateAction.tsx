"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CertificateRecord = {
  certificateId: string;
};

type EligibilityPayload = {
  eligible: boolean;
  adminOverride: boolean;
  percentage: number;
  reason: string;
  displayName: string;
  requiresDisplayName: boolean;
  courseName: string;
  certificate?: CertificateRecord | null;
};

export function CertificateAction({
  appSlug,
  compact = false,
}: {
  appSlug: string;
  compact?: boolean;
}) {
  const [eligibility, setEligibility] = useState<EligibilityPayload | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadEligibility() {
      const response = await fetch(`/api/certificates/eligibility?appSlug=${appSlug}`);
      if (!response.ok) return;
      const payload = (await response.json()) as EligibilityPayload;
      if (mounted) setEligibility(payload);
    }

    loadEligibility();
    return () => {
      mounted = false;
    };
  }, [appSlug]);

  if (!eligibility) return null;

  if (eligibility.certificate) {
    return (
      <Link
        href={`/certificates/${eligibility.certificate.certificateId}`}
        className="rounded-full border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-black text-amber-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-100"
      >
        Lihat Diploma Certificate
      </Link>
    );
  }

  if (!eligibility.eligible) {
    return compact ? (
      <p className="text-xs font-semibold text-slate-500">{eligibility.reason}</p>
    ) : (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
        {eligibility.reason}
      </div>
    );
  }

  async function generateCertificate() {
    setLoading(true);
    setStatus("");

    const response = await fetch("/api/certificates/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appSlug }),
    });
    const payload = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setStatus(payload.error ?? "Certificate belum bisa dibuat.");
      return;
    }

    window.location.href = `/certificates/${payload.certificate.certificateId}`;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-full border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-black text-amber-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-100"
      >
        Lihat Diploma Certificate
      </button>

      {confirming ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-700">
              Certificate name
            </p>
            <h2 className="mt-3 text-2xl font-black text-slate-950">
              Nama di sertifikat akan dicetak sebagai:
            </h2>
            <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-xl font-black text-slate-950">
              {eligibility.displayName || "Nama belum diisi"}
            </p>
            {eligibility.adminOverride ? (
              <p className="mt-3 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">
                Admin users are eligible to obtain this certificate.
              </p>
            ) : null}
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Pastikan nama sudah benar sesuai pengaturan akun.
            </p>
            {status ? <p className="mt-3 text-sm font-semibold text-rose-700">{status}</p> : null}
            <div className="mt-6 flex flex-wrap gap-3">
              {eligibility.requiresDisplayName ? (
                <Link
                  href="/platform/settings"
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white"
                >
                  Ubah nama di pengaturan
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={generateCertificate}
                  disabled={loading}
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
                >
                  {loading ? "Generating..." : "Sudah benar, generate certificate"}
                </button>
              )}
              <Link
                href="/platform/settings"
                className="rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-slate-800"
              >
                Ubah nama di pengaturan
              </Link>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-slate-800"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
