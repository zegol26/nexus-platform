export default function PmpIttoLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <div className="h-32 animate-pulse rounded-2xl bg-white/10" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-44 animate-pulse rounded-2xl bg-white/10" />
        ))}
      </div>
    </div>
  );
}
