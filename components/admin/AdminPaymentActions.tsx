"use client";

import { useState } from "react";
import { canActOnPayment } from "@/lib/platform/payment-policy";

export function AdminPaymentActions({ paymentId, paymentStatus }: { paymentId: string; paymentStatus: string }) {
  const [status, setStatus] = useState("");
  const actionAllowed = canActOnPayment(paymentStatus);

  async function verify(action: "PAID" | "REJECTED") {
    const response = await fetch(`/api/platform/admin/payments/${paymentId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const payload = await response.json();
    setStatus(response.ok ? `Marked ${action}. Refresh to see latest status.` : payload.error ?? "Action failed.");
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => verify("PAID")} disabled={!actionAllowed} className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500">
          Verify Paid
        </button>
        <button type="button" onClick={() => verify("REJECTED")} disabled={!actionAllowed} className="rounded-full bg-rose-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500">
          Reject
        </button>
      </div>
      {status ? <p className="text-xs text-slate-500">{status}</p> : null}
    </div>
  );
}
