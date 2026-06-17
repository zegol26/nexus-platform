"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { canActOnPayment } from "@/lib/platform/payment-policy";

export function AdminPaymentActions({
  paymentId,
  paymentStatus,
  paymentProvider,
  providerRef,
}: {
  paymentId: string;
  paymentStatus: string;
  paymentProvider: string;
  providerRef: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [syncing, setSyncing] = useState(false);
  const actionAllowed = canActOnPayment(paymentStatus);
  const isMidtrans = paymentProvider === "MIDTRANS";
  const canSyncMidtrans = isMidtrans && Boolean(providerRef);

  async function verify(action: "PAID" | "REJECTED") {
    const response = await fetch(`/api/platform/admin/payments/${paymentId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const payload = await response.json();
    setStatus(response.ok ? `Marked ${action}. Refresh to see latest status.` : payload.error ?? "Action failed.");
  }

  async function syncMidtrans() {
    setSyncing(true);
    setStatus("Checking Midtrans status...");

    try {
      const response = await fetch(`/api/platform/admin/payments/${paymentId}/sync-midtrans`, {
        method: "POST",
      });
      const payload = await response.json();
      const providerStatus = payload.providerStatus?.transaction_status
        ? `Midtrans: ${payload.providerStatus.transaction_status}`
        : "Midtrans checked";
      const localStatus = payload.payment?.status ? `Local: ${payload.payment.status}` : "";

      setStatus(
        response.ok
          ? [providerStatus, localStatus, "Refreshing..."].filter(Boolean).join(" | ")
          : payload.error ?? "Midtrans sync failed."
      );

      if (response.ok) {
        router.refresh();
      }
    } catch {
      setStatus("Midtrans sync failed.");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {isMidtrans ? (
          <button type="button" onClick={syncMidtrans} disabled={!canSyncMidtrans || syncing} className="rounded-full bg-blue-700 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500">
            {syncing ? "Syncing..." : "Sync Midtrans"}
          </button>
        ) : (
          <>
            <button type="button" onClick={() => verify("PAID")} disabled={!actionAllowed} className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500">
              Verify Paid
            </button>
            <button type="button" onClick={() => verify("REJECTED")} disabled={!actionAllowed} className="rounded-full bg-rose-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500">
              Reject
            </button>
          </>
        )}
      </div>
      {status ? <p className="text-xs text-slate-500">{status}</p> : null}
    </div>
  );
}
