import { AdminSection } from "@/components/admin/AdminTable";
import { prisma } from "@/lib/db/prisma";

export default async function AdminQuizzesPage() {
  const [assessmentCount, mockCount] = await Promise.all([
    prisma.assessmentQuestion.count({ where: { isActive: true } }),
    prisma.nihongoMockTestQuestion.count({ where: { isActive: true } }),
  ]);

  return (
    <AdminSection title="Quizzes" description="View assessment and JLPT mock-test question banks.">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-5"><p className="text-3xl font-semibold">{assessmentCount}</p><p className="text-sm text-slate-500">Assessment questions</p></div>
        <div className="rounded-2xl bg-slate-50 p-5"><p className="text-3xl font-semibold">{mockCount}</p><p className="text-sm text-slate-500">Mock-test questions</p></div>
      </div>
    </AdminSection>
  );
}
