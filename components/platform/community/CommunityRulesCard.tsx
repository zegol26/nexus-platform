const dos = [
  "Tanya hal belajar, karier, Jepang, bahasa, budaya, atau topik produktif.",
  "Bantu jawab dengan sopan, ringkas, dan mudah dipahami.",
  "Berikan onigiri untuk kontribusi yang membantu.",
];

const donts = [
  "SARA, serangan identitas, hinaan, atau bahasa kasar.",
  "Spam, promosi berlebihan, jualan, atau pesan berulang.",
  "Link pornografi, scam, judi, malware, phishing, atau data pribadi orang lain.",
];

export function CommunityRulesCard() {
  return (
    <section className="rounded-3xl border border-violet-300/20 bg-slate-950/85 p-4 shadow-xl shadow-violet-950/10 backdrop-blur-xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-200">Aturan Komunitas</p>
      <h2 className="mt-1 text-base font-semibold text-white">Do and Don&apos;t</h2>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">Do</p>
          <ul className="mt-2 space-y-2 text-xs leading-5 text-emerald-50">
            {dos.map((rule) => (
              <li key={rule} className="border-l-2 border-emerald-300/70 pl-2">{rule}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-rose-300/35 bg-rose-400/10 p-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-200">Don&apos;t</p>
          <ul className="mt-2 space-y-2 text-xs leading-5 text-rose-50">
            {donts.map((rule) => (
              <li key={rule} className="border-l-2 border-rose-300/70 pl-2">{rule}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
