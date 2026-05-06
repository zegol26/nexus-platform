export function GlobalFooter({ product = "Nexus Platform" }: { product?: string }) {
  return (
    <footer className="border-t border-slate-200/70 bg-white/70 px-4 py-5 text-xs text-slate-500 backdrop-blur sm:px-8 lg:px-10">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <span>{product}</span>
        <span>© 2026 PT Nexus Talenta Indonesia. All rights reserved.</span>
      </div>
    </footer>
  );
}
