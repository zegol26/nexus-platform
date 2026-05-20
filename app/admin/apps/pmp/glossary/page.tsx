import { AdminSection } from "@/components/admin/AdminTable";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPmpGlossaryPage() {
  const terms = await prisma.pmpGlossaryTerm.findMany({ orderBy: { term: "asc" } });
  return (
    <AdminSection title="PMP Glossary" description="Manage PMP glossary terms. Search and CRUD endpoints are available through /api/admin/apps/pmp/glossary.">
      <div className="grid gap-3 md:grid-cols-2">
        {terms.map((term) => (
          <div key={term.id} className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{term.category} / {term.examVersion}</p>
            <h3 className="font-semibold">{term.term}{term.acronym ? ` (${term.acronym})` : ""}</h3>
            <p className="mt-2 text-sm text-slate-600">{term.simpleMeaning}</p>
          </div>
        ))}
      </div>
    </AdminSection>
  );
}
