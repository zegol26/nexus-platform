"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, ExternalLink, XCircle } from "lucide-react";

type PaymentStatusPayload = {
  orderId: string;
  paymentStatus: string;
  paidAt: string | null;
  app: {
    slug: string;
    name: string;
  };
  accessActive: boolean;
  accessStatus: string | null;
};

const FINAL_FAILURE_STATUSES = new Set(["REJECTED", "EXPIRED"]);
const POLL_INTERVAL_MS = 2500;
const MAX_POLL_MS = 30000;

export function PaymentFinishStatus({
  orderId,
  gatewayStatus,
}: {
  orderId: string;
  gatewayStatus: string;
}) {
  const [payload, setPayload] = useState<PaymentStatusPayload | null>(null);
  const [error, setError] = useState("");
  const [timedOut, setTimedOut] = useState(false);

  const isSuccess = payload?.paymentStatus === "PAID" && payload.accessActive;
  const isFailure = payload ? FINAL_FAILURE_STATUSES.has(payload.paymentStatus) : false;

  useEffect(() => {
    if (!orderId) return;

    const startedAt = Date.now();
    let cancelled = false;
    let timer: number | undefined;

    async function fetchStatus() {
      let terminal = false;
      try {
        const response = await fetch(
          `/api/platform/billing/payments/status?orderId=${encodeURIComponent(orderId)}`,
          { cache: "no-store" }
        );
        const nextPayload = await response.json();

        if (cancelled) return;

        if (!response.ok) {
          setError(nextPayload.error ?? "Status pembayaran belum bisa dibaca.");
        } else {
          setError("");
          const typedPayload = nextPayload as PaymentStatusPayload;
          setPayload(typedPayload);
          terminal =
            (typedPayload.paymentStatus === "PAID" && typedPayload.accessActive) ||
            FINAL_FAILURE_STATUSES.has(typedPayload.paymentStatus);
        }
      } catch {
        if (!cancelled) setError("Koneksi status pembayaran belum tersedia.");
      }

      if (cancelled) return;

      const elapsed = Date.now() - startedAt;
      if (elapsed >= MAX_POLL_MS) {
        setTimedOut(true);
        return;
      }

      if (terminal) return;
      timer = window.setTimeout(fetchStatus, POLL_INTERVAL_MS);
    }

    fetchStatus();

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [orderId]);

  const title = useMemo(() => {
    if (isSuccess) return "Pembayaran berhasil";
    if (isFailure) return "Pembayaran belum berhasil";
    return "Pembayaran sedang diproses";
  }, [isFailure, isSuccess]);

  return (
    <div className="mt-5 grid gap-4">
      <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
        <p className="flex items-center gap-2 font-semibold text-slate-950">
          {isSuccess ? <CheckCircle2 size={18} /> : isFailure ? <XCircle size={18} /> : <Clock3 size={18} />}
          {title}
        </p>
        <p>Order ID: {orderId || "Menunggu data gateway"}</p>
        <p>Status gateway: {gatewayStatus || "Dalam proses"}</p>
        <p>Status Nexus: {payload?.paymentStatus ?? "Menunggu notifikasi resmi"}</p>
        <p>Akses aplikasi: {payload?.accessActive ? "Aktif" : "Belum aktif"}</p>
        {error ? <p className="font-semibold text-amber-700">{error}</p> : null}
        {timedOut && !isSuccess ? (
          <p className="font-semibold text-amber-700">
            Status masih diproses. Silakan cek billing beberapa saat lagi atau hubungi admin dengan Order ID ini.
          </p>
        ) : null}
      </div>

      {isSuccess && payload?.app.slug === "nihongo" ? (
        <Link href="/apps/nihongo/dashboard" className="nexus-primary w-fit">
          <ExternalLink size={18} /> Buka Nexus AI Nihongo
        </Link>
      ) : null}
    </div>
  );
}
