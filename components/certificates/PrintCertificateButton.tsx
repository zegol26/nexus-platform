"use client";

export function PrintCertificateButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white"
    >
      Print / Download PDF
    </button>
  );
}
