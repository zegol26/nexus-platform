import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getKnowledgeAreaPracticeQuestions } from "@/lib/pmp/knowledge-area-questions";
import { IttoFlowGraphic } from "@/components/apps/pmp/PmpProcessMap";

export const dynamic = "force-dynamic";

export default async function PmpIttoDetailPage({ params }: { params: Promise<{ processId: string }> }) {
  const { processId } = await params;
  const process = await prisma.pmpIttoProcess.findUnique({
    where: { id: processId },
    include: {
      inputs: { orderBy: { name: "asc" } },
      tools: { orderBy: { name: "asc" } },
      outputs: { orderBy: { name: "asc" } },
    },
  });
  if (!process || !process.isActive) notFound();
  const practiceQuestions = getKnowledgeAreaPracticeQuestions(process.knowledgeArea);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/apps/pmp/itto" className="text-sm font-semibold text-cyan-300">Back to ITTO Explorer</Link>
      <section className="rounded-2xl border border-white/10 bg-slate-900 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">{process.processGroup} / {process.knowledgeArea}</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">{process.processName}</h1>
        <p className="mt-4 text-sm leading-7 text-slate-300">{process.purpose}</p>
      </section>

      <IttoFlowGraphic />

      <div className="grid gap-4 md:grid-cols-3">
        <IttoList title="Inputs" items={process.inputs} />
        <IttoList title="Tools & Techniques" items={process.tools} />
        <IttoList title="Outputs" items={process.outputs} />
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <Info title="Simple Example" text={process.simpleExample ?? ""} />
        <Info title="Common Trap" text={process.commonPitfall ?? ""} tone="warning" />
        <Info title="Agile / Hybrid Interpretation" text={process.agileHybridNote ?? ""} />
        <Info title="PMP Exam Mindset Note" text={process.studyTip ?? ""} />
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-900 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">{process.knowledgeArea} KA Practice</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">20 Original Scenario Questions</h2>
        <div className="mt-5 grid gap-4">
          {practiceQuestions.map((question) => (
            <details key={question.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <summary className="cursor-pointer text-sm font-semibold text-white">{question.id}: {question.prompt}</summary>
              <div className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
                {(["A", "B", "C", "D"] as const).map((choice) => (
                  <p key={choice}><span className="font-bold text-cyan-200">{choice}.</span> {question.options[choice]}</p>
                ))}
                <p className="font-semibold text-emerald-200">Correct: {question.correctAnswer}</p>
                <p className="text-amber-100">{question.explanation}</p>
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

function IttoList({ title, items }: { title: string; items: Array<{ id: string; name: string; description: string; simpleExample: string | null; examTip: string | null }> }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900 p-5">
      <h2 className="font-semibold text-white">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl bg-white/[0.04] p-3">
            <p className="font-semibold text-cyan-100">{item.name}</p>
            <p className="mt-1 text-xs leading-5 text-slate-300">{item.description}</p>
            {item.examTip ? <p className="mt-2 text-xs font-semibold text-amber-100">{item.examTip}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function Info({ title, text, tone = "default" }: { title: string; text: string; tone?: "default" | "warning" }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <h2 className="font-semibold text-white">{title}</h2>
      <p className={`mt-2 text-sm leading-6 ${tone === "warning" ? "text-amber-100" : "text-slate-300"}`}>{text}</p>
    </section>
  );
}
