export function OnigiriBadge({ badge }: { badge: string }) {
  if (!badge) return null;

  return (
    <span className="rounded-full border border-amber-200/70 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
      {badge}
    </span>
  );
}
