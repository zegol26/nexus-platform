export type AnalyticsKpiCard = {
  label: string;
  value: string | number;
  helper?: string;
};

export function AnalyticsKpiGrid({ cards }: { cards: AnalyticsKpiCard[] }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-lg shadow-slate-950/[0.03] backdrop-blur"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {card.label}
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{card.value}</p>
          {card.helper ? (
            <p className="mt-2 text-sm leading-6 text-slate-500">{card.helper}</p>
          ) : null}
        </div>
      ))}
    </section>
  );
}

export function AnalyticsPanel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-950/[0.04] backdrop-blur">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function AnalyticsEmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
      {label}
    </div>
  );
}
