import { AdminSection } from "@/components/admin/AdminTable";
import { prisma } from "@/lib/db/prisma";

export default async function AdminFlashcardsPage() {
  const [count, decks] = await Promise.all([
    prisma.nihongoFlashcard.count(),
    prisma.nihongoFlashcard.findMany({ distinct: ["deck"], select: { deck: true }, orderBy: { deck: "asc" } }),
  ]);

  return (
    <AdminSection title="Flashcards" description="View flashcard cache/deck coverage.">
      <p className="text-4xl font-semibold">{count}</p>
      <p className="mt-2 text-sm text-slate-500">Total cards</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {decks.map((deck) => <span key={deck.deck} className="rounded-full bg-slate-100 px-3 py-1 text-sm">{deck.deck}</span>)}
      </div>
    </AdminSection>
  );
}
