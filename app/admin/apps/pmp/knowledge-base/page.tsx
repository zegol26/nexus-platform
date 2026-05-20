import { AdminSection } from "@/components/admin/AdminTable";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPmpKnowledgeBasePage() {
  const articles = await prisma.pmpKnowledgeArticle.findMany({ orderBy: { title: "asc" } });
  return (
    <AdminSection title="PMP Knowledge Base" description="Manage PMP knowledge articles and preview seeded learning content.">
      <div className="grid gap-3">
        {articles.map((article) => (
          <div key={article.id} className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{article.category} / {article.examVersion}</p>
            <h3 className="font-semibold">{article.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{article.summary}</p>
          </div>
        ))}
      </div>
    </AdminSection>
  );
}
