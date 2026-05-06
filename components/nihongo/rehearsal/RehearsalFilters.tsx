import type { RehearsalSection } from "@/app/apps/nihongo/full-rehearsal-n5/n5RehearsalData";

type CategoryFilter = RehearsalSection["category"] | "all";

type RehearsalFiltersProps = {
  search: string;
  selectedCategory: CategoryFilter;
  categories: readonly { id: string; label: string }[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: CategoryFilter) => void;
};

export function RehearsalFilters({
  search,
  selectedCategory,
  categories,
  onSearchChange,
  onCategoryChange,
}: RehearsalFiltersProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        Cari materi
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Cari judul, pola, kanji, atau kata kunci..."
          className="h-12 rounded-2xl border border-slate-300 px-4 text-sm font-normal outline-none transition focus:border-cyan-500"
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onCategoryChange(category.id as CategoryFilter)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              selectedCategory === category.id
                ? "bg-slate-950 text-white"
                : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-cyan-50"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>
    </section>
  );
}
