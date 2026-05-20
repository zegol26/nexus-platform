import { AdminSection } from "@/components/admin/AdminTable";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPmpIttoPage() {
  const processes = await prisma.pmpIttoProcess.findMany({
    include: { inputs: true, tools: true, outputs: true },
    orderBy: [{ sortOrder: "asc" }, { processName: "asc" }],
  });

  return (
    <AdminSection title="PMP ITTO" description="Manage PMP process-group, knowledge-area, and ITTO learning records. Use the admin API for create/edit/deactivate.">
      <div className="grid gap-3">
        {processes.map((process) => (
          <div key={process.id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{process.processGroup} / {process.knowledgeArea} / {process.examVersion}</p>
                <h3 className="font-semibold">{process.processName}</h3>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${process.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{process.isActive ? "Active" : "Inactive"}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{process.purpose}</p>
            <p className="mt-2 text-xs text-slate-500">I/T/O: {process.inputs.length}/{process.tools.length}/{process.outputs.length}</p>
          </div>
        ))}
      </div>
    </AdminSection>
  );
}
