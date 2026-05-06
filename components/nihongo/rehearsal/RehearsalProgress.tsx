type RehearsalProgressProps = {
  reviewedCount: number;
  totalCount: number;
  onReset: () => void;
};

export function RehearsalProgress({
  reviewedCount,
  totalCount,
  onReset,
}: RehearsalProgressProps) {
  const progress = totalCount ? Math.round((reviewedCount / totalCount) * 100) : 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">Progres review</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">
            {reviewedCount}/{totalCount} section selesai
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="w-fit rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Reset Progres
        </button>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-xs font-semibold text-slate-500">{progress}% selesai</p>
    </section>
  );
}
