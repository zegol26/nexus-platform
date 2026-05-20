import { prisma } from "./seed-client";
import { CURATED_ARTICLES, CURATED_GLOSSARY } from "./seed-pmp-knowledge";

const processMap = [
  ["Develop Project Charter", "Initiating", "Integration"],
  ["Identify Stakeholders", "Initiating", "Stakeholder"],
  ["Develop Project Management Plan", "Planning", "Integration"],
  ["Plan Scope Management", "Planning", "Scope"],
  ["Collect Requirements", "Planning", "Scope"],
  ["Define Scope", "Planning", "Scope"],
  ["Create WBS", "Planning", "Scope"],
  ["Plan Schedule Management", "Planning", "Schedule"],
  ["Define Activities", "Planning", "Schedule"],
  ["Sequence Activities", "Planning", "Schedule"],
  ["Estimate Activity Durations", "Planning", "Schedule"],
  ["Develop Schedule", "Planning", "Schedule"],
  ["Plan Cost Management", "Planning", "Cost"],
  ["Estimate Costs", "Planning", "Cost"],
  ["Determine Budget", "Planning", "Cost"],
  ["Plan Quality Management", "Planning", "Quality"],
  ["Plan Resource Management", "Planning", "Resource"],
  ["Estimate Activity Resources", "Planning", "Resource"],
  ["Plan Communications Management", "Planning", "Communications"],
  ["Plan Risk Management", "Planning", "Risk"],
  ["Identify Risks", "Planning", "Risk"],
  ["Perform Qualitative Risk Analysis", "Planning", "Risk"],
  ["Perform Quantitative Risk Analysis", "Planning", "Risk"],
  ["Plan Risk Responses", "Planning", "Risk"],
  ["Plan Procurement Management", "Planning", "Procurement"],
  ["Plan Stakeholder Engagement", "Planning", "Stakeholder"],
  ["Direct and Manage Project Work", "Executing", "Integration"],
  ["Manage Project Knowledge", "Executing", "Integration"],
  ["Manage Quality", "Executing", "Quality"],
  ["Acquire Resources", "Executing", "Resource"],
  ["Develop Team", "Executing", "Resource"],
  ["Manage Team", "Executing", "Resource"],
  ["Manage Communications", "Executing", "Communications"],
  ["Implement Risk Responses", "Executing", "Risk"],
  ["Conduct Procurements", "Executing", "Procurement"],
  ["Manage Stakeholder Engagement", "Executing", "Stakeholder"],
  ["Monitor and Control Project Work", "Monitoring and Controlling", "Integration"],
  ["Perform Integrated Change Control", "Monitoring and Controlling", "Integration"],
  ["Validate Scope", "Monitoring and Controlling", "Scope"],
  ["Control Scope", "Monitoring and Controlling", "Scope"],
  ["Control Schedule", "Monitoring and Controlling", "Schedule"],
  ["Control Costs", "Monitoring and Controlling", "Cost"],
  ["Control Quality", "Monitoring and Controlling", "Quality"],
  ["Control Resources", "Monitoring and Controlling", "Resource"],
  ["Monitor Communications", "Monitoring and Controlling", "Communications"],
  ["Monitor Risks", "Monitoring and Controlling", "Risk"],
  ["Control Procurements", "Monitoring and Controlling", "Procurement"],
  ["Monitor Stakeholder Engagement", "Monitoring and Controlling", "Stakeholder"],
  ["Close Project or Phase", "Closing", "Integration"],
] as const;

const kaProfiles: Record<string, { domain: string; inputs: string[]; tools: string[]; outputs: string[]; terms: string[] }> = {
  Integration: {
    domain: "Process",
    inputs: ["Business case", "Benefits management plan", "Project charter", "Project management plan", "Work performance data", "Approved change requests"],
    tools: ["Expert judgment", "Facilitation", "Change control tools", "Project management information system", "Knowledge management"],
    outputs: ["Project charter", "Project management plan", "Change requests", "Work performance reports", "Lessons learned register", "Final report"],
    terms: ["Project Charter", "Change Request", "Lessons Learned Register"],
  },
  Scope: {
    domain: "Process",
    inputs: ["Project charter", "Requirements documentation", "Stakeholder register", "Scope management plan", "Assumption log"],
    tools: ["Interviews", "Workshops", "Decomposition", "Product analysis", "Data analysis"],
    outputs: ["Scope management plan", "Requirements documentation", "Project scope statement", "WBS", "Accepted deliverables"],
    terms: ["Scope Baseline", "WBS", "Requirements Traceability Matrix"],
  },
  Schedule: {
    domain: "Process",
    inputs: ["Scope baseline", "Activity list", "Milestone list", "Resource calendars", "Schedule data"],
    tools: ["Rolling wave planning", "Precedence diagramming", "Critical path method", "Three-point estimating", "Schedule compression"],
    outputs: ["Activity list", "Project schedule", "Schedule baseline", "Duration estimates", "Schedule forecasts"],
    terms: ["Critical Path", "Float", "Lead", "Lag"],
  },
  Cost: {
    domain: "Process",
    inputs: ["Project management plan", "Scope baseline", "Schedule baseline", "Risk register", "Resource requirements"],
    tools: ["Analogous estimating", "Parametric estimating", "Bottom-up estimating", "Reserve analysis", "Earned value analysis"],
    outputs: ["Cost estimates", "Basis of estimates", "Cost baseline", "Project funding requirements", "Cost forecasts"],
    terms: ["Cost Baseline", "Contingency Reserve", "Earned Value Management"],
  },
  Quality: {
    domain: "Process",
    inputs: ["Quality management plan", "Requirements documentation", "Risk register", "Deliverables", "Work performance data"],
    tools: ["Cost of quality", "Root cause analysis", "Audits", "Inspection", "Test and evaluation"],
    outputs: ["Quality management plan", "Quality reports", "Test results", "Verified deliverables", "Change requests"],
    terms: ["Quality Assurance", "Quality Control", "Root Cause Analysis"],
  },
  Resource: {
    domain: "People",
    inputs: ["Resource management plan", "Project schedule", "Resource calendars", "Team charter", "Issue log"],
    tools: ["Responsibility assignment matrix", "Negotiation", "Virtual teams", "Training", "Conflict management"],
    outputs: ["Resource requirements", "Team charter", "Resource assignments", "Team performance assessments", "Issue log updates"],
    terms: ["RACI Matrix", "Team Charter", "Conflict Management"],
  },
  Communications: {
    domain: "People",
    inputs: ["Stakeholder register", "Communications management plan", "Work performance reports", "Issue log"],
    tools: ["Communication methods", "Communication models", "Meetings", "Information management systems", "Feedback"],
    outputs: ["Communications management plan", "Project communications", "Updated issue log", "Work performance information"],
    terms: ["Communication Management Plan", "Stakeholder Engagement Plan"],
  },
  Risk: {
    domain: "Process",
    inputs: ["Risk management plan", "Risk register", "Assumption log", "Stakeholder register", "Project documents"],
    tools: ["Risk workshops", "Probability and impact assessment", "Decision tree analysis", "Simulation", "Risk response strategies"],
    outputs: ["Risk register", "Risk report", "Risk responses", "Change requests", "Project document updates"],
    terms: ["Risk Register", "Risk Response", "Risk Appetite"],
  },
  Procurement: {
    domain: "Process",
    inputs: ["Procurement management plan", "Make-or-buy decisions", "Source selection criteria", "Seller proposals", "Agreements"],
    tools: ["Make-or-buy analysis", "Bidder conferences", "Proposal evaluation", "Negotiation", "Claims administration"],
    outputs: ["Procurement strategy", "Procurement documents", "Selected sellers", "Agreements", "Closed procurements"],
    terms: ["Make-or-Buy Analysis", "Fixed Price Contract", "Time and Material Contract"],
  },
  Stakeholder: {
    domain: "People",
    inputs: ["Business documents", "Project charter", "Stakeholder register", "Issue log", "Communications records"],
    tools: ["Stakeholder analysis", "Power interest grid", "Salience model", "Facilitation", "Interpersonal skills"],
    outputs: ["Stakeholder register", "Stakeholder engagement plan", "Change requests", "Issue log updates"],
    terms: ["Stakeholder Register", "Power Interest Grid", "Salience Model"],
  },
};

const glossaryTerms = [
  "Project Charter", "Business Case", "Benefits Management Plan", "Project Management Plan", "Subsidiary Management Plan", "Baseline", "Scope Baseline", "Schedule Baseline", "Cost Baseline", "Requirements Documentation", "Requirements Traceability Matrix", "Work Breakdown Structure", "WBS Dictionary", "Activity", "Milestone", "Critical Path", "Float", "Lead", "Lag", "Rolling Wave Planning", "Progressive Elaboration", "Analogous Estimating", "Parametric Estimating", "Bottom-Up Estimating", "Three-Point Estimating", "Contingency Reserve", "Management Reserve", "Cost of Quality", "Quality Assurance", "Quality Control", "Audit", "Inspection", "Root Cause Analysis", "Change Request", "Change Control", "Change Control Board", "Integrated Change Control", "Configuration Management", "Issue Log", "Risk Register", "Risk Report", "Risk Appetite", "Risk Threshold", "Risk Response", "Avoid", "Mitigate", "Transfer", "Accept", "Exploit", "Enhance", "Share", "Escalate", "Stakeholder Register", "Stakeholder Engagement Plan", "Power Interest Grid", "Salience Model", "Communication Management Plan", "Procurement Management Plan", "Make-or-Buy Analysis", "Fixed Price Contract", "Cost Reimbursable Contract", "Time and Material Contract", "RACI Matrix", "Responsibility Assignment Matrix", "Resource Calendar", "Team Charter", "Virtual Team", "Conflict Management", "Servant Leadership", "Emotional Intelligence", "Negotiation", "Facilitation", "Coaching", "Mentoring", "Agile", "Scrum", "Kanban", "Sprint", "Iteration", "Product Backlog", "Sprint Backlog", "Increment", "Definition of Done", "Definition of Ready", "Product Owner", "Scrum Master", "Development Team", "Daily Standup", "Sprint Review", "Sprint Retrospective", "Backlog Refinement", "Velocity", "Burndown Chart", "Burnup Chart", "Cumulative Flow Diagram", "User Story", "Story Point", "Epic", "Minimum Viable Product", "MVP", "Product Roadmap", "Release Planning", "Hybrid Project", "Predictive Project", "Adaptive Project", "Value Delivery", "Benefits Realization", "Governance", "Compliance", "PMO", "Portfolio", "Program", "Project", "Operations", "Deliverable", "Assumption", "Constraint", "Dependency", "Lessons Learned Register", "Lessons Learned Repository", "OPAs", "EEFs", "Risk Owner", "Issue Owner", "Acceptance Criteria", "Change Log", "Schedule Compression", "Fast Tracking", "Crashing", "Resource Leveling", "Resource Smoothing", "Monte Carlo Analysis", "Decision Tree", "Expected Monetary Value", "Stakeholder Engagement Assessment Matrix", "Communication Channel", "Push Communication", "Pull Communication", "Interactive Communication", "Procurement Statement of Work", "Bidder Conference", "Source Selection Criteria", "Claims Administration", "Control Account", "Planning Package", "Work Package", "Code of Accounts", "Variance Analysis", "Trend Analysis", "Forecasting", "Estimate at Completion", "Estimate to Complete", "Budget at Completion", "Planned Value", "Earned Value", "Actual Cost", "Cost Performance Index", "Schedule Performance Index", "Definition of Value", "Product Vision", "Outcome", "Hypothesis Testing", "Experiment", "Sustainability", "AI-Assisted Planning", "Data Privacy", "Ethics", "Psychological Safety", "Self-Organizing Team", "Servant Leader", "Impediment", "Retrospective Action Item", "Value Stream", "Flow Efficiency", "Work in Progress Limit", "Definition of Workflow",
];

const articles = [
  "PMP Mindset: choose proactive, collaborative, ethical actions",
  "How to answer what should the project manager do next",
  "Predictive vs Agile vs Hybrid",
  "Why ITTO memorization is not enough",
  "Project charter vs project management plan",
  "Change request vs issue vs risk",
  "Risk response strategies",
  "Stakeholder engagement strategy",
  "Servant leadership in PMP scenarios",
  "Conflict management and team facilitation",
  "Business value and benefits realization",
  "Governance and compliance",
  "Baselines and performance measurement",
  "Earned Value Management basics",
  "Critical path and schedule compression",
  "Quality assurance vs quality control",
  "Procurement contract types",
  "Communication methods and stakeholder needs",
  "Agile ceremonies and artifacts",
  "Agile metrics: velocity, burndown, cumulative flow",
  "Hybrid delivery decision logic",
  "Lessons learned and continuous improvement",
  "Ethics and professional responsibility",
  "AI in project management for PMP 2026 readiness",
  "Sustainability in project management for PMP 2026 readiness",
];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function categoryForTerm(term: string) {
  const agile = ["Agile", "Scrum", "Kanban", "Sprint", "Backlog", "Velocity", "Burndown", "Burnup", "User Story", "Epic", "MVP", "Self-Organizing", "WIP", "Flow"];
  if (agile.some((word) => term.includes(word))) return "Agile";
  if (term.includes("Risk") || ["Avoid", "Mitigate", "Transfer", "Accept", "Exploit", "Enhance", "Share", "Escalate"].includes(term)) return "Risk";
  if (term.includes("Stakeholder")) return "Stakeholder";
  if (term.includes("Procurement") || term.includes("Contract") || term.includes("Seller") || term.includes("Bidder")) return "Procurement";
  if (term.includes("Quality") || term.includes("Audit") || term.includes("Inspection") || term.includes("Root Cause")) return "Quality";
  if (term.includes("Cost") || term.includes("Budget") || term.includes("Earned") || term.includes("Value") || term.includes("CPI") || term.includes("EAC")) return "Cost";
  if (term.includes("Schedule") || term.includes("Critical") || term.includes("Float") || term.includes("Lead") || term.includes("Lag")) return "Schedule";
  if (term.includes("Scope") || term.includes("WBS") || term.includes("Requirement")) return "Scope";
  if (term.includes("Team") || term.includes("Leadership") || term.includes("Conflict") || term.includes("Coaching")) return "Leadership";
  if (term.includes("AI") || term.includes("Sustainability")) return "AI and Sustainability for 2026 readiness";
  return "Integration";
}

function processStudyTip(processName: string, knowledgeArea: string) {
  const tips: Record<string, string> = {
    Integration: "PMP tip: kalau proses ini muncul, cari jawaban yang menyatukan informasi lintas area sebelum membuat keputusan besar.",
    Scope: "PMP tip: bedakan requirement, scope, dan accepted deliverable; jangan langsung approve perubahan tanpa impact analysis.",
    Schedule: "PMP tip: ketika waktu terancam, cek dependency, critical path, dan compression option sebelum menyuruh tim lembur.",
    Cost: "PMP tip: jawaban terbaik biasanya membaca variance dan forecast dulu, bukan langsung memotong scope atau meminta budget.",
    Quality: "PMP tip: defect berulang mengarah ke root cause dan perbaikan proses, bukan hanya quick fix.",
    Resource: "PMP tip: konflik dan skill gap diselesaikan dengan facilitation, coaching, training, atau negotiation sesuai konteks.",
    Communications: "PMP tip: kalau pesan tidak efektif, sesuaikan method, audience, dan feedback loop, bukan tambah report saja.",
    Risk: "PMP tip: pisahkan risk, issue, trigger, response, dan owner; jangan menunggu risk menjadi masalah baru bergerak.",
    Procurement: "PMP tip: baca kontrak dan procurement strategy sebelum menghukum seller atau mengubah pekerjaan vendor.",
    Stakeholder: "PMP tip: resistance sering berarti expectation gap; engage, clarify interest, lalu sesuaikan engagement strategy.",
  };
  return `${tips[knowledgeArea] ?? tips.Integration} Untuk ${processName}, tanyakan: informasi apa yang masuk, metode apa yang membantu keputusan, dan output apa yang mengubah project flow?`;
}

function processPitfall(knowledgeArea: string) {
  const pitfalls: Record<string, string> = {
    Integration: "Common trap: memilih jawaban yang terlihat tegas tetapi mengabaikan integrated impact ke scope, schedule, cost, risk, dan stakeholder.",
    Scope: "Common trap: menganggap setiap permintaan user otomatis harus masuk scope, atau menolak semua perubahan hanya karena baseline sudah ada.",
    Schedule: "Common trap: langsung crashing atau fast tracking tanpa memahami critical path dan risiko kualitas.",
    Cost: "Common trap: melihat budget variance sebagai masalah angka saja, padahal bisa berasal dari scope, schedule, risk, atau estimating assumption.",
    Quality: "Common trap: menyamakan quality control dengan quality management; PMP sering menguji pencegahan, bukan hanya inspeksi akhir.",
    Resource: "Common trap: mengganti orang terlalu cepat sebelum mencoba coaching, conflict resolution, atau role clarity.",
    Communications: "Common trap: mengirim lebih banyak update, padahal masalahnya channel, timing, stakeholder need, atau misunderstanding.",
    Risk: "Common trap: escalate risk terlalu dini atau membiarkan risk tanpa owner, trigger, dan response.",
    Procurement: "Common trap: bereaksi ke vendor issue tanpa mengecek agreement, claim path, dan shared understanding.",
    Stakeholder: "Common trap: fokus ke stakeholder paling senior saja dan mengabaikan user operasional yang menentukan acceptance.",
  };
  return pitfalls[knowledgeArea] ?? pitfalls.Integration;
}

function itemExamTip(itemName: string, type: "input" | "toolTechnique" | "output", knowledgeArea: string) {
  if (type === "input") {
    return `Exam tip: kalau ${itemName} muncul sebagai input, gunakan untuk memahami batasan dan konteks sebelum memilih tindakan ${knowledgeArea}.`;
  }
  if (type === "toolTechnique") {
    return `Exam tip: ${itemName} biasanya menunjuk cara berpikir/analisis. Pilih ini saat soal meminta FIRST dan data belum cukup untuk aksi final.`;
  }
  return `Exam tip: ${itemName} adalah hasil yang mengubah baseline, dokumen, keputusan, atau komunikasi. Jangan pilih output sebelum proses berpikirnya masuk akal.`;
}

function glossaryMindset(term: string, category: string) {
  const lower = term.toLowerCase();
  if (lower.includes("charter")) return "PMPism: sebelum project resmi jalan, jangan lompat ke detailed schedule; pastikan authorization, sponsor, dan business need jelas.";
  if (lower.includes("baseline")) return "PMPism: baseline adalah pembanding kinerja. Jika ada deviasi, analisis variance dan change path sebelum mengubah rencana.";
  if (lower.includes("risk")) return "PMPism: risk dikelola sebelum jadi issue. Cari owner, trigger, response, dan update register/report sesuai dampaknya.";
  if (["Avoid", "Mitigate", "Transfer", "Accept", "Exploit", "Enhance", "Share", "Escalate"].includes(term)) return `PMPism: ${term} adalah strategi response; pilih berdasarkan jenis risiko/opportunity, authority, dan apakah tindakan masih dalam kendali project team.`;
  if (lower.includes("stakeholder")) return "PMPism: stakeholder resistance jarang diselesaikan dengan memaksa. Cari interest, expectation gap, influence, dan engagement strategy.";
  if (lower.includes("change")) return "PMPism: change bukan otomatis diterima atau ditolak. First move biasanya impact analysis dan mengikuti change control yang disepakati.";
  if (lower.includes("quality") || lower.includes("audit") || lower.includes("inspection") || lower.includes("root cause")) return "PMPism: soal quality sering menjebak antara memperbaiki defect cepat dan memperbaiki penyebab sistemik. Recurring issue perlu root cause.";
  if (lower.includes("critical path") || lower.includes("float") || lower.includes("lead") || lower.includes("lag")) return "PMPism: schedule decision harus membaca dependency dan critical path; jangan langsung tambah resource tanpa tahu bottleneck.";
  if (lower.includes("contract") || lower.includes("procurement") || lower.includes("seller") || lower.includes("bidder")) return "PMPism: vendor issue harus dibaca lewat agreement, procurement documents, dan relationship health sebelum penalty/escalation.";
  if (lower.includes("scrum") || lower.includes("sprint") || lower.includes("backlog") || lower.includes("kanban") || category === "Agile") return "PMPism: dalam agile, project lead melindungi transparency, team ownership, dan product decision flow; jangan command-and-control tim.";
  if (lower.includes("cost") || lower.includes("earned value") || ["CPI", "SPI", "EAC", "ETC", "BAC"].some((abbr) => term.includes(abbr))) return "PMPism: angka EVM adalah sinyal diagnosis. Pilih jawaban yang membaca trend/forecast sebelum aksi korektif.";
  if (lower.includes("ai") || lower.includes("sustainability")) return "PMPism 2026 readiness: perlakukan AI/sustainability sebagai governance, ethics, value, risk, dan stakeholder impact, bukan sekadar teknologi tambahan.";
  if (category === "Leadership") return "PMPism: people problem biasanya diselesaikan dengan listening, facilitation, coaching, role clarity, dan psychological safety sebelum eskalasi.";
  return `PMPism: saat ${term} muncul, tanyakan fungsi praktisnya: apakah ini konteks keputusan, metode analisis, artifact, atau sinyal untuk melibatkan stakeholder tertentu?`;
}

function processSpecificItto(
  processName: string,
  fallback: { inputs: string[]; tools: string[]; outputs: string[] }
) {
  const map: Record<string, { inputs: string[]; tools: string[]; outputs: string[] }> = {
    "Develop Project Charter": {
      inputs: ["Business case", "Benefits management plan", "Agreements", "Enterprise environmental factors", "Organizational process assets"],
      tools: ["Expert judgment", "Data gathering", "Interpersonal skills", "Meetings"],
      outputs: ["Project charter", "Assumption log"],
    },
    "Identify Stakeholders": {
      inputs: ["Project charter", "Business documents", "Agreements", "Procurement documents", "Enterprise environmental factors"],
      tools: ["Stakeholder analysis", "Questionnaires", "Meetings", "Power interest grid"],
      outputs: ["Stakeholder register", "Change requests", "Project document updates"],
    },
    "Develop Project Management Plan": {
      inputs: ["Project charter", "Outputs from planning processes", "Enterprise environmental factors", "Organizational process assets"],
      tools: ["Expert judgment", "Facilitation", "Conflict management", "Meetings"],
      outputs: ["Project management plan"],
    },
    "Collect Requirements": {
      inputs: ["Project charter", "Stakeholder register", "Scope management plan", "Requirements management plan"],
      tools: ["Interviews", "Focus groups", "Workshops", "Questionnaires", "Prototypes"],
      outputs: ["Requirements documentation", "Requirements traceability matrix"],
    },
    "Define Scope": {
      inputs: ["Project charter", "Requirements documentation", "Scope management plan", "Assumption log"],
      tools: ["Product analysis", "Alternatives analysis", "Facilitation", "Expert judgment"],
      outputs: ["Project scope statement", "Project document updates"],
    },
    "Create WBS": {
      inputs: ["Scope management plan", "Project scope statement", "Requirements documentation"],
      tools: ["Decomposition", "Expert judgment"],
      outputs: ["Scope baseline", "Project document updates"],
    },
    "Define Activities": {
      inputs: ["Schedule management plan", "Scope baseline", "Enterprise environmental factors"],
      tools: ["Decomposition", "Rolling wave planning", "Expert judgment"],
      outputs: ["Activity list", "Activity attributes", "Milestone list"],
    },
    "Sequence Activities": {
      inputs: ["Schedule management plan", "Activity list", "Milestone list", "Project scope statement"],
      tools: ["Precedence diagramming", "Dependency determination", "Leads and lags"],
      outputs: ["Project schedule network diagrams", "Project document updates"],
    },
    "Estimate Activity Durations": {
      inputs: ["Schedule management plan", "Activity list", "Resource requirements", "Resource calendars", "Risk register"],
      tools: ["Analogous estimating", "Parametric estimating", "Three-point estimating", "Reserve analysis"],
      outputs: ["Duration estimates", "Basis of estimates"],
    },
    "Develop Schedule": {
      inputs: ["Schedule management plan", "Activity list", "Network diagrams", "Duration estimates", "Resource calendars"],
      tools: ["Schedule network analysis", "Critical path method", "Resource optimization", "Schedule compression"],
      outputs: ["Schedule baseline", "Project schedule", "Schedule data", "Project calendars"],
    },
    "Estimate Costs": {
      inputs: ["Cost management plan", "Scope baseline", "Project schedule", "Risk register", "Resource requirements"],
      tools: ["Analogous estimating", "Parametric estimating", "Bottom-up estimating", "Three-point estimating", "Reserve analysis"],
      outputs: ["Cost estimates", "Basis of estimates"],
    },
    "Determine Budget": {
      inputs: ["Cost management plan", "Scope baseline", "Cost estimates", "Basis of estimates", "Project schedule"],
      tools: ["Cost aggregation", "Reserve analysis", "Funding limit reconciliation", "Expert judgment"],
      outputs: ["Cost baseline", "Project funding requirements"],
    },
    "Plan Risk Responses": {
      inputs: ["Risk management plan", "Risk register", "Risk report", "Resource management plan", "Cost baseline"],
      tools: ["Threat response strategies", "Opportunity response strategies", "Contingent response strategies", "Decision making"],
      outputs: ["Change requests", "Project management plan updates", "Project document updates"],
    },
    "Perform Integrated Change Control": {
      inputs: ["Project management plan", "Work performance reports", "Change requests", "Enterprise environmental factors"],
      tools: ["Change control tools", "Data analysis", "Decision making", "Meetings"],
      outputs: ["Approved change requests", "Change log", "Project management plan updates"],
    },
    "Validate Scope": {
      inputs: ["Scope baseline", "Verified deliverables", "Requirements documentation", "Work performance data"],
      tools: ["Inspection", "Decision making"],
      outputs: ["Accepted deliverables", "Change requests", "Work performance information"],
    },
    "Close Project or Phase": {
      inputs: ["Project charter", "Project management plan", "Accepted deliverables", "Business documents", "Agreements"],
      tools: ["Expert judgment", "Data analysis", "Meetings"],
      outputs: ["Final product or service transition", "Final report", "Organizational process asset updates"],
    },
  };

  if (map[processName]) return map[processName];

  if (processName.startsWith("Plan ")) {
    return {
      inputs: ["Project charter", "Project management plan components", "Enterprise environmental factors", "Organizational process assets"],
      tools: ["Expert judgment", "Data analysis", "Meetings", "Facilitation"],
      outputs: [`${processName.replace("Plan ", "")} plan`, "Project management plan updates"],
    };
  }
  if (processName.startsWith("Control ") || processName.startsWith("Monitor ")) {
    return {
      inputs: ["Project management plan", "Project documents", "Work performance data", "Organizational process assets"],
      tools: ["Data analysis", "Variance analysis", "Trend analysis", "Meetings"],
      outputs: ["Work performance information", "Change requests", "Project document updates"],
    };
  }
  if (processName.startsWith("Manage ") || processName.startsWith("Direct ") || processName.startsWith("Implement ") || processName.startsWith("Conduct ") || processName.startsWith("Acquire ") || processName.startsWith("Develop Team")) {
    return {
      inputs: ["Project management plan", "Project documents", "Enterprise environmental factors", "Organizational process assets"],
      tools: ["Expert judgment", "Interpersonal skills", "Meetings", "Project management information system"],
      outputs: ["Deliverables or work results", "Issue log updates", "Change requests", "Project document updates"],
    };
  }

  return fallback;
}

export async function seedPmpLearning() {
  for (const [index, [processName, processGroup, knowledgeArea]] of processMap.entries()) {
    const profile = kaProfiles[knowledgeArea];
    const itto = processSpecificItto(processName, profile);
    const process = await prisma.pmpIttoProcess.upsert({
      where: { processName_examVersion: { processName, examVersion: "both" } },
      create: {
        processName,
        processGroup,
        knowledgeArea,
        domain: profile.domain,
        approach: "predictive",
        examVersion: "both",
        purpose: `${processName} membantu project manager mengelola area ${knowledgeArea} dengan alur kerja yang jelas, keputusan terdokumentasi, dan orientasi value.`,
        whenToUse: `Gunakan proses ini saat area ${knowledgeArea} membutuhkan perencanaan, eksekusi, pemantauan, atau penutupan yang terstruktur sesuai fase ${processGroup}.`,
        simpleExample: `Contoh Nexus: tim implementasi HR system memakai ${processName} untuk menjaga keputusan ${knowledgeArea.toLowerCase()} tetap transparan sebelum berdampak ke jadwal dan stakeholder.`,
        agileHybridNote: `Dalam agile/hybrid, konsep ${knowledgeArea} tetap hidup, tetapi artefaknya bisa lebih ringan: backlog, working agreement, visual board, review berkala, dan keputusan adaptif.`,
        commonPitfall: processPitfall(knowledgeArea),
        studyTip: processStudyTip(processName, knowledgeArea),
        sortOrder: index + 1,
      },
      update: {
        processGroup,
        knowledgeArea,
        domain: profile.domain,
        purpose: `${processName} membantu project manager mengelola area ${knowledgeArea} dengan alur kerja yang jelas, keputusan terdokumentasi, dan orientasi value.`,
        whenToUse: `Gunakan proses ini saat area ${knowledgeArea} membutuhkan perencanaan, eksekusi, pemantauan, atau penutupan yang terstruktur sesuai fase ${processGroup}.`,
        simpleExample: `Contoh Nexus: tim implementasi HR system memakai ${processName} untuk menjaga keputusan ${knowledgeArea.toLowerCase()} tetap transparan sebelum berdampak ke jadwal dan stakeholder.`,
        agileHybridNote: `Dalam agile/hybrid, konsep ${knowledgeArea} tetap hidup, tetapi artefaknya bisa lebih ringan: backlog, working agreement, visual board, review berkala, dan keputusan adaptif.`,
        commonPitfall: processPitfall(knowledgeArea),
        studyTip: processStudyTip(processName, knowledgeArea),
        sortOrder: index + 1,
        isActive: true,
      },
    });

    await prisma.pmpIttoItem.deleteMany({
      where: { OR: [{ inputForId: process.id }, { toolForId: process.id }, { outputForId: process.id }] },
    });

    const createItem = (name: string, type: "input" | "toolTechnique" | "output") =>
      prisma.pmpIttoItem.create({
        data: {
          name,
          type,
          description: `${name} adalah elemen pembelajaran ${type} untuk ${processName}. Gunakan sebagai petunjuk alur, bukan hafalan mati.`,
          simpleExample: `Dalam proyek HR system, ${name} membantu tim memahami keputusan ${knowledgeArea.toLowerCase()} secara praktis.`,
          examTip: itemExamTip(name, type, knowledgeArea),
          relatedTerms: profile.terms,
          examVersion: "both",
          ...(type === "input" ? { inputForId: process.id } : {}),
          ...(type === "toolTechnique" ? { toolForId: process.id } : {}),
          ...(type === "output" ? { outputForId: process.id } : {}),
        },
      });

    await Promise.all([
      ...itto.inputs.slice(0, 6).map((name) => createItem(name, "input")),
      ...itto.tools.slice(0, 6).map((name) => createItem(name, "toolTechnique")),
      ...itto.outputs.slice(0, 5).map((name) => createItem(name, "output")),
    ]);
  }

  for (const term of glossaryTerms) {
    const category = categoryForTerm(term);
    await prisma.pmpGlossaryTerm.upsert({
      where: { term_examVersion: { term, examVersion: "both" } },
      create: {
        term,
        acronym: term === "Work Breakdown Structure" ? "WBS" : term === "Organizational Process Assets" ? "OPA" : undefined,
        category,
        definition: `${term} adalah konsep project management yang membantu project manager membuat keputusan lebih terstruktur, transparan, dan value-driven.`,
        simpleMeaning: `${term} berarti cara praktis untuk membuat pekerjaan, keputusan, atau informasi project lebih jelas bagi tim dan stakeholder.`,
        example: `Contoh: pada proyek digital Nexus, ${term} dipakai agar sponsor, tim, dan user memahami kondisi project sebelum memilih tindakan berikutnya.`,
        pmpMindset: glossaryMindset(term, category),
        relatedTerms: [category, "PMP Mindset", "Value Delivery"],
        approach: category === "Agile" ? "agile" : "general",
        examVersion: "both",
        difficulty: category.includes("AI") ? "medium" : "medium",
      },
      update: {
        category,
        definition: `${term} adalah konsep project management yang membantu project manager membuat keputusan lebih terstruktur, transparan, dan value-driven.`,
        simpleMeaning: `${term} berarti cara praktis untuk membuat pekerjaan, keputusan, atau informasi project lebih jelas bagi tim dan stakeholder.`,
        example: `Contoh: pada proyek digital Nexus, ${term} dipakai agar sponsor, tim, dan user memahami kondisi project sebelum memilih tindakan berikutnya.`,
        pmpMindset: glossaryMindset(term, category),
        relatedTerms: [category, "PMP Mindset", "Value Delivery"],
        approach: category === "Agile" ? "agile" : "general",
        isActive: true,
      },
    });
  }

  for (const title of articles) {
    const slug = slugify(title);
    const category = title.includes("AI") ? "AI in Project Management" : title.includes("Sustainability") ? "Sustainability in Project Management" : title.includes("Agile") ? "Agile Project Management" : title.includes("Hybrid") ? "Hybrid Delivery" : title.includes("ITTO") ? "ITTO Study Guide" : "PMP Mindset";
    await prisma.pmpKnowledgeArticle.upsert({
      where: { slug },
      create: {
        slug,
        title,
        category,
        domain: title.includes("Business") || title.includes("Governance") ? "Business Environment" : title.includes("Servant") || title.includes("Conflict") ? "People" : "Process",
        approach: title.includes("Agile") ? "agile" : title.includes("Hybrid") ? "hybrid" : "general",
        examVersion: title.includes("2026") ? "2026" : "both",
        summary: `${title} dijelaskan sebagai panduan belajar PMP Nexus dengan bahasa original, practical, dan berorientasi scenario judgment.`,
        content: [
          `## Konsep Utama`,
          `${title} harus dipahami sebagai cara berpikir, bukan sekadar definisi. PMP menilai kemampuan memilih tindakan terbaik ketika project menghadapi ketidakpastian, stakeholder tension, constraint, dan kebutuhan value.`,
          `## Contoh Cerita`,
          `Dalam proyek implementasi platform training, sponsor ingin cepat launch, user minta perubahan, dan tim teknis melihat risiko kualitas. Project manager yang exam-safe tidak langsung memerintah atau escalate; ia mengklarifikasi fakta, melibatkan pihak yang tepat, menilai impact, lalu memilih tindakan yang paling responsible.`,
          `## PMIism / PMP Mindset`,
          `Cari jawaban yang proactive, collaborative, ethical, value-driven, dan adaptive. Hindari jawaban yang menyalahkan orang, melewati analisis, atau menyerahkan semua keputusan ke sponsor terlalu cepat.`,
        ].join("\n\n"),
        keyTakeaways: ["Jangan hafal tanpa memahami flow.", "Analisis sebelum aksi.", "Value dan stakeholder thinking penting untuk current dan 2026 exam."],
        examples: { project: "Nexus platform rollout", scenario: "stakeholder change, risk, and value trade-off" },
        relatedTerms: ["PMP Mindset", "Value Delivery", "Stakeholder Engagement"],
        studyTip: "Setelah membaca, buat satu contoh soal FIRST/NEXT/PREVENT dari topik ini.",
      },
      update: {
        category,
        summary: `${title} dijelaskan sebagai panduan belajar PMP Nexus dengan bahasa original, practical, dan berorientasi scenario judgment.`,
        isActive: true,
      },
    });
  }

  // Curated, hand-authored articles override the thin auto-generated ones for the
  // priority topics (procurement, contract types, risk, EVM, quality, agile, etc.).
  for (const article of CURATED_ARTICLES) {
    await prisma.pmpKnowledgeArticle.upsert({
      where: { slug: article.slug },
      create: {
        slug: article.slug,
        title: article.title,
        category: article.category,
        domain: article.domain,
        approach: article.approach,
        examVersion: article.examVersion,
        summary: article.summary,
        content: article.content,
        keyTakeaways: article.keyTakeaways,
        relatedTerms: article.relatedTerms,
        studyTip: article.studyTip,
      },
      update: {
        title: article.title,
        category: article.category,
        domain: article.domain,
        approach: article.approach,
        examVersion: article.examVersion,
        summary: article.summary,
        content: article.content,
        keyTakeaways: article.keyTakeaways,
        relatedTerms: article.relatedTerms,
        studyTip: article.studyTip,
        isActive: true,
      },
    });
  }

  // Curated glossary terms override the thin auto-generated entries for high-priority concepts.
  for (const entry of CURATED_GLOSSARY) {
    await prisma.pmpGlossaryTerm.upsert({
      where: { term_examVersion: { term: entry.term, examVersion: entry.examVersion } },
      create: {
        term: entry.term,
        acronym: entry.acronym,
        category: entry.category,
        definition: entry.definition,
        simpleMeaning: entry.simpleMeaning,
        example: entry.example,
        pmpMindset: entry.pmpMindset,
        relatedTerms: entry.relatedTerms,
        approach: entry.approach,
        examVersion: entry.examVersion,
        difficulty: entry.difficulty,
      },
      update: {
        acronym: entry.acronym,
        category: entry.category,
        definition: entry.definition,
        simpleMeaning: entry.simpleMeaning,
        example: entry.example,
        pmpMindset: entry.pmpMindset,
        relatedTerms: entry.relatedTerms,
        approach: entry.approach,
        difficulty: entry.difficulty,
        isActive: true,
      },
    });
  }

  console.log(
    `PMP learning seeded: ${processMap.length} ITTO processes, ${glossaryTerms.length} glossary terms, ${articles.length} auto + ${CURATED_ARTICLES.length} curated articles, ${CURATED_GLOSSARY.length} curated glossary entries`
  );
}

if (require.main === module) {
  seedPmpLearning()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
