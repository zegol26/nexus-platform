import { Fragment } from "react";

type ProcessMapItem = {
  id: string;
  processName: string;
  processGroup: string;
  knowledgeArea: string;
};

const knowledgeAreas = [
  "Integration",
  "Scope",
  "Schedule",
  "Cost",
  "Quality",
  "Resource",
  "Communications",
  "Risk",
  "Procurement",
  "Stakeholder",
];

const processGroups = [
  "Initiating",
  "Planning",
  "Executing",
  "Monitoring and Controlling",
  "Closing",
];

export function PmpProcessMap({ processes }: { processes: ProcessMapItem[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
      <div className="border-b border-white/10 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Graphical Map</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Process Groups x Knowledge Areas</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Baca dari kiri ke kanan sebagai project flow, lalu turun ke Knowledge Area untuk melihat area keputusan yang diuji.
        </p>
      </div>
      <div className="overflow-x-auto p-4">
        <div className="grid min-w-[980px] grid-cols-[160px_repeat(5,1fr)] gap-2">
          <div className="rounded-lg bg-white/5 p-3 text-xs font-bold uppercase tracking-wide text-slate-400">
            Knowledge Area
          </div>
          {processGroups.map((group) => (
            <div key={group} className="rounded-lg bg-cyan-300/15 p-3 text-center text-xs font-bold text-cyan-100">
              {group}
            </div>
          ))}
          {knowledgeAreas.map((area) => (
            <Fragment key={area}>
              <div key={`${area}-label`} className="rounded-lg bg-white/5 p-3 text-sm font-semibold text-white">
                {area}
              </div>
              {processGroups.map((group) => {
                const cells = processes.filter(
                  (process) => process.knowledgeArea === area && process.processGroup === group
                );
                return (
                  <div key={`${area}-${group}`} className="min-h-20 rounded-lg border border-white/10 bg-black/20 p-2">
                    <div className="grid gap-1">
                      {cells.map((process) => (
                        <a
                          key={process.id}
                          href={`/apps/pmp/itto/${process.id}`}
                          className="rounded-md bg-white/[0.07] px-2 py-1 text-[11px] leading-4 text-slate-100 transition hover:bg-cyan-300 hover:text-slate-950"
                        >
                          {process.processName}
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

export function IttoFlowGraphic() {
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">ITTO Flow</p>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_40px_1fr_40px_1fr] md:items-center">
        <FlowBox title="Inputs" body="Context, plans, documents, data, constraints" />
        <Arrow />
        <FlowBox title="Tools & Techniques" body="Analysis, facilitation, estimating, decision methods" />
        <Arrow />
        <FlowBox title="Outputs" body="Artifacts, decisions, baselines, updates, requests" />
      </div>
    </section>
  );
}

function FlowBox({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-4">
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-cyan-50">{body}</p>
    </div>
  );
}

function Arrow() {
  return <div className="hidden text-center text-2xl font-bold text-cyan-300 md:block">-&gt;</div>;
}
