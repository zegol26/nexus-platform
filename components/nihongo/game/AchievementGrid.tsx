export type Achievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
};

export function AchievementGrid({ achievements }: { achievements: Achievement[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {achievements.map((achievement) => (
        <div
          key={achievement.id}
          className={`rounded-2xl border p-4 transition ${
            achievement.unlocked
              ? "border-amber-200 bg-amber-50 text-slate-950"
              : "border-slate-200 bg-slate-50 text-slate-500"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{achievement.title}</p>
              <p className="mt-1 text-xs leading-5">{achievement.description}</p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                achievement.unlocked ? "bg-amber-200 text-amber-900" : "bg-white text-slate-400"
              }`}
            >
              {achievement.unlocked ? "Unlocked" : "Locked"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
