export function LoadingState({ label = "Sedang memproses data…" }: { label?: string }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-5 text-sm font-semibold text-slate-200 shadow-sm backdrop-blur">
      {label}
    </div>
  );
}
