export type AnswerRecord = {
  question: number;
  domain: "People" | "Process" | "Business Environment" | "Biz";
  chosen: string;
  correct: string;
  trap?: string;
  timeSeconds?: number;
};

type DomainKey = "People" | "Process" | "Business Environment";

function normalizeDomain(domain: AnswerRecord["domain"]): DomainKey {
  return domain === "Biz" ? "Business Environment" : domain;
}

function statusFromPercent(percent: number) {
  if (percent >= 80) return "Above Target";
  if (percent >= 68) return "Target";
  if (percent >= 55) return "Below Target";
  return "Needs Improvement";
}

function formatPercent(correct: number, total: number) {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}

export function analyzePmpPerformance(records: AnswerRecord[]) {
  const domains: Record<DomainKey, { total: number; correct: number }> = {
    People: { total: 0, correct: 0 },
    Process: { total: 0, correct: 0 },
    "Business Environment": { total: 0, correct: 0 },
  };
  const blocks = [
    { label: "Q1-60", total: 0, correct: 0 },
    { label: "Q61-120", total: 0, correct: 0 },
    { label: "Q121-180", total: 0, correct: 0 },
  ];
  const traps = {
    escalation: 0,
    firefighter: 0,
    agileAgnostic: 0,
  };

  for (const record of records) {
    const correct = record.chosen === record.correct;
    const domain = normalizeDomain(record.domain);
    domains[domain].total += 1;
    if (correct) domains[domain].correct += 1;

    const blockIndex = record.question <= 60 ? 0 : record.question <= 120 ? 1 : 2;
    blocks[blockIndex].total += 1;
    if (correct) blocks[blockIndex].correct += 1;

    const trap = (record.trap ?? "").toLowerCase();
    if (trap.includes("escal")) traps.escalation += 1;
    if (trap.includes("fire") || trap.includes("react")) traps.firefighter += 1;
    if (trap.includes("agile") || trap.includes("command")) traps.agileAgnostic += 1;
  }

  return {
    domains: Object.entries(domains).map(([domain, value]) => {
      const percent = formatPercent(value.correct, value.total);
      return {
        domain,
        correct: value.correct,
        total: value.total,
        percent,
        status: statusFromPercent(percent),
      };
    }),
    blocks: blocks.map((block) => {
      const percent = formatPercent(block.correct, block.total);
      return {
        ...block,
        percent,
        status: statusFromPercent(percent),
      };
    }),
    traps,
  };
}

export function renderPmpDiagnosticMarkdown(records: AnswerRecord[]) {
  const analysis = analyzePmpPerformance(records);
  const domainLines = analysis.domains
    .map(
      (domain) =>
        `- ${domain.domain}: ${domain.status} (${domain.correct}/${domain.total}, ${domain.percent}%)`
    )
    .join("\n");
  const blockLines = analysis.blocks
    .map((block) => `- ${block.label}: ${block.status} (${block.percent}%)`)
    .join("\n");
  const strongestTrap = Object.entries(analysis.traps).sort((a, b) => b[1] - a[1])[0];

  return `## Executive Performance Dashboard
${domainLines}

## Fatigue Factor Analysis
${blockLines}

Read this as endurance data, not just knowledge data. A late-block drop usually means the learner needs shorter review loops, stricter pacing, and more confidence with ambiguous wording.

## Behavior Pattern Flaws
- The Escalation Trap: ${analysis.traps.escalation} flagged responses.
- The Firefighter Trap: ${analysis.traps.firefighter} flagged responses.
- The Agile Agnostic Trap: ${analysis.traps.agileAgnostic} flagged responses.

Primary remediation focus: ${strongestTrap?.[0] ?? "balanced review"}.

## Custom 7-Day Hyper-Remediation Plan
- Day 1: Rebuild the exam mindset: diagnose before acting, collaborate before escalating.
- Day 2: Drill People-domain conflict, motivation, and stakeholder scenarios.
- Day 3: Drill Process-domain risk, change, quality, and procurement scenarios.
- Day 4: Drill agile and hybrid questions where servant leadership beats command-and-control.
- Day 5: Review every wrong answer and label the trap type.
- Day 6: Complete one timed 60-question block with strict pacing.
- Day 7: Review fatigue pattern, repeat weakest 20 questions, and write a personal decision checklist.`;
}
