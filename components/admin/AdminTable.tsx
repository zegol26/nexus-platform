export function AdminSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function EmptyState({ label }: { label: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">{label}</div>;
}
