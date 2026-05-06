export function CommunityInfoCard({ canCreateRoom }: { canCreateRoom: boolean }) {
  const items = [
    "Diskusi dibuat untuk belajar bersama, bukan adu paling benar.",
    "Gunakan nama asli dan avatar akun agar terasa aman.",
    "Badge learning journey tampil di bawah nama.",
    "Room baru terbuka setelah Flashcard Spark.",
    "Onigiri dipakai untuk apresiasi kontribusi positif.",
  ];

  return (
    <section className="rounded-3xl border border-cyan-300/25 bg-slate-950/85 p-4 shadow-xl shadow-cyan-950/10 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">Info Board</p>
          <h2 className="mt-1 text-base font-semibold text-white">Cara main komunitas</h2>
        </div>
        <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold text-cyan-100">
          {canCreateRoom ? "Room aktif" : "Flashcard Spark"}
        </span>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <p key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs leading-5 text-slate-300">
            {item}
          </p>
        ))}
      </div>

      {!canCreateRoom ? (
        <div className="mt-3 rounded-2xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-100">
          Kamu bisa membuat room setelah mencapai level Flashcard Spark.
        </div>
      ) : null}
    </section>
  );
}
