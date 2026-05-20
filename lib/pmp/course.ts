export type PmpCourseLesson = {
  id: string;
  week: string;
  title: string;
  domain: "People" | "Process" | "Business Environment" | "Mixed";
  outcome: string;
  estimateHours: number;
  plainEnglish: string;
  nexusCoachNotes: string[];
  drills: string[];
  examTraps: string[];
  fastTrack?: string;
};

export type PmpSimulationQuestion = {
  id: string;
  domain: "People" | "Process" | "Business Environment";
  approach: "Agile" | "Hybrid" | "Predictive";
  difficulty: "Target" | "Above_Target";
  scenario: string;
  options: Record<"A" | "B" | "C" | "D", string>;
  correctAnswer: "A" | "B" | "C" | "D";
  trap: "escalation" | "firefighter" | "agile-command" | "scope-rigidity" | "none";
  explanation: string;
};

export const FAST_TRACK_ESTIMATE_DISCLAIMER =
  "Estimasi waktu bersifat indikatif (rata-rata learner sambil kerja, ~2 jam/hari). Hasil aktual sangat bergantung pada pengalaman sebelumnya di project management, kecepatan baca, dan disiplin latihan. Andromeda tidak menjamin lulus PMP — ini accelerator yang membantu lo belajar lebih fokus dan scenario-based.";

export const PMP_NEXUS_COURSE: PmpCourseLesson[] = [
  {
    id: "mindset-first-next",
    week: "Sprint 1",
    title: "Nexus PMP Mindset: First, Next, Prevent",
    domain: "Mixed",
    estimateHours: 2,
    outcome: "Learner can separate analysis, collaboration, action, escalation, and prevention choices.",
    fastTrack: "Hafalin pola FIRST = pahami situasi, NEXT = tindakan kecil yang responsible, PREVENT = lihat ke belakang (plan/comm/risk/stakeholder).",
    plainEnglish:
      "Most wrong answers are not absurd. They are just one step too early, too aggressive, or too detached from the people doing the work.",
    nexusCoachNotes: [
      "FIRST → understanding the situation before acting.",
      "NEXT → smallest responsible action that protects value and relationships.",
      "PREVENT → look back for planning, communication, risk, or stakeholder alignment.",
    ],
    drills: ["Sort 30 actions into First/Next/Prevent", "Rewrite reactive actions into collaborative actions"],
    examTraps: ["Sponsor escalation before team diagnosis", "Immediate change before impact analysis"],
  },
  {
    id: "process-groups-knowledge-areas",
    week: "Sprint 1",
    title: "Process Groups × Knowledge Areas Map",
    domain: "Process",
    estimateHours: 3,
    outcome: "Learner can locate any process by its Process Group (Initiating/Planning/Executing/M&C/Closing) and one of the 10 Knowledge Areas.",
    fastTrack: "Don't memorize all 49 ITTOs. Memorize the GRID (5 PGs × 10 KAs) and the FLOW (charter → plan → execute → control → close).",
    plainEnglish:
      "Think of Process Groups as time-phases of the project, and Knowledge Areas as the lens you look through (scope, schedule, cost, etc.). Every process lives at one intersection of that grid.",
    nexusCoachNotes: [
      "Initiating: Develop Charter, Identify Stakeholders.",
      "Planning is the heaviest column — 24 processes spread across all 10 KAs.",
      "Closing is intentionally light (only Close Project or Phase) — heavy benefits work happens earlier and after.",
    ],
    drills: ["Map 10 processes to PG×KA from memory", "Spot odd-one-out across PG columns"],
    examTraps: ["Confusing Direct & Manage Work (Executing) with Monitor & Control Work (M&C)"],
  },
  {
    id: "people-conflict-safety",
    week: "Sprint 2",
    title: "Conflict, Trust, and Psychological Safety",
    domain: "People",
    estimateHours: 3,
    outcome: "Learner can choose coaching/facilitation responses before command-and-control responses, and pick the correct Thomas-Kilmann conflict mode for the scenario.",
    fastTrack: "Default to COLLABORATE/PROBLEM-SOLVE on the exam. Pick COMPROMISE only when time-boxed and stakes are even. Avoid FORCE/WITHDRAW unless the scenario clearly demands it.",
    plainEnglish:
      "The project manager is not the loudest problem solver in the room. The role is to create conditions where the right people solve the right problem safely.",
    nexusCoachNotes: [
      "Thomas-Kilmann modes: Collaborate / Compromise / Accommodate / Avoid / Force.",
      "Maslow vs Herzberg: Maslow = ladder of needs; Herzberg = hygiene factors prevent dissatisfaction, motivators create satisfaction.",
      "Tuckman: Forming → Storming → Norming → Performing → Adjourning.",
      "Private coaching beats public correction.",
    ],
    drills: ["Conflict response ladder", "Match motivation theory to scenario", "Tuckman stage diagnosis"],
    examTraps: ["Replacing a team member too early", "Forcing decisions during the Storming stage"],
  },
  {
    id: "stakeholder-value",
    week: "Sprint 2",
    title: "Stakeholders, Engagement, and Communication",
    domain: "People",
    estimateHours: 3,
    outcome: "Learner can identify stakeholders, classify them (power/interest, salience, engagement assessment matrix), and tailor communications.",
    fastTrack: "Stakeholder formulas: comm channels = n(n-1)/2. Engagement levels = Unaware / Resistant / Neutral / Supportive / Leading. Always close the gap between Current ‘C’ and Desired ‘D’.",
    plainEnglish:
      "Stakeholder management is less about pleasing everyone and more about making expectations visible before they become expensive surprises.",
    nexusCoachNotes: [
      "Power/Interest grid — 4 quadrants, Manage Closely sits at High/High.",
      "Salience model — Power × Legitimacy × Urgency.",
      "Communication channels formula: n(n-1)/2. Add 1 stakeholder = a lot more channels.",
    ],
    drills: ["Stakeholder heat map", "Comms channel math drill", "Engagement gap analysis"],
    examTraps: ["Ignoring a low-power stakeholder with high operational impact", "Sending a generic status report"],
  },
  {
    id: "scope-schedule-cost",
    week: "Sprint 3",
    title: "Scope, Schedule, and Cost — The Iron Triangle",
    domain: "Process",
    estimateHours: 4,
    outcome: "Learner can run scope decomposition (WBS), interpret a network diagram (critical path, float, lead/lag), and compute basic EVM (CV, SV, CPI, SPI, EAC, ETC, VAC).",
    fastTrack: "EVM cheat: CV = EV − AC. SV = EV − PV. CPI = EV/AC. SPI = EV/PV. EAC = BAC/CPI (typical). ETC = EAC − AC. VAC = BAC − EAC. Negative variance / index < 1 = bad.",
    plainEnglish:
      "Scope says ‘what’, schedule says ‘when’, cost says ‘how much’. Earned Value tells you whether the three are still speaking the same language.",
    nexusCoachNotes: [
      "Float = LS − ES = LF − EF. Zero float = critical path.",
      "Fast tracking adds risk (parallel work). Crashing adds cost (more resources).",
      "Reserve analysis: contingency reserve (known unknowns, owned by PM) vs management reserve (unknown unknowns, owned by sponsor).",
    ],
    drills: ["WBS decomposition", "Forward/backward pass", "EVM number drills"],
    examTraps: ["Crashing the wrong activity (non-critical adds cost but not time)", "Using management reserve for known risks"],
  },
  {
    id: "quality-tools",
    week: "Sprint 3",
    title: "Quality — 7 Basic Tools + Pareto, Fishbone, Control Chart",
    domain: "Process",
    estimateHours: 2,
    outcome: "Learner can select the correct quality tool for the scenario (Pareto for prioritization, fishbone for root cause, control chart for stability, etc.) and distinguish QA from QC.",
    fastTrack: "Quality vs Grade: quality is non-negotiable; grade is a category. Prevention > Inspection. COQ = Cost of Conformance + Cost of Non-Conformance. Andromeda tip: recurring defect → fishbone, not quick fix.",
    plainEnglish:
      "Quality is not a final inspection ceremony. It is a shared working agreement that starts before anyone builds the wrong thing beautifully.",
    nexusCoachNotes: [
      "Pareto (80/20): focus on the 20% of causes producing 80% of defects.",
      "Ishikawa / fishbone: 6Ms — Manpower, Machine, Method, Material, Measurement, Mother Nature.",
      "Control chart: ‘rule of seven’ = 7 consecutive points on one side of mean = process out of control even if within limits.",
      "QA = Plan Quality + Manage Quality (process-focused). QC = Control Quality (product-focused inspection).",
    ],
    drills: ["Choose-the-tool quiz", "Fishbone for a recurring defect", "Control chart anomaly spotting"],
    examTraps: ["Confusing QA with QC", "Using inspection as the primary quality strategy"],
  },
  {
    id: "risk-management",
    week: "Sprint 3",
    title: "Risk — Identification → Response → Monitor",
    domain: "Process",
    estimateHours: 3,
    outcome: "Learner can run qualitative + quantitative risk analysis, compute EMV from a decision tree, and pick the right response strategy for threats and opportunities.",
    fastTrack: "Threats: AVOID / TRANSFER / MITIGATE / ACCEPT / ESCALATE. Opportunities: EXPLOIT / SHARE / ENHANCE / ACCEPT / ESCALATE. EMV = Probability × Impact (sum across branches in a decision tree).",
    plainEnglish:
      "A risk is a weather forecast, an issue is rain on your desk, and a change request is asking whether the route itself must move.",
    nexusCoachNotes: [
      "Risk register columns: ID, description, category, P/I, score, owner, response, trigger, status.",
      "Secondary risk = new risk created by your response. Residual risk = risk that remains after response.",
      "Monte Carlo simulation gives a probability distribution, not a single answer.",
    ],
    drills: ["Risk vs issue sorting", "EMV decision-tree drill", "Threat/opportunity strategy match"],
    examTraps: ["Skipping impact analysis", "Using escalation as the first move", "Not assigning a risk owner"],
  },
  {
    id: "procurement-deep",
    week: "Sprint 4",
    title: "Procurement — RFI, RFQ, RFP, Contract Types, Source Selection, Claims",
    domain: "Process",
    estimateHours: 3,
    outcome: "Learner can choose the right solicitation document and contract type based on scope clarity, risk tolerance, and buyer/seller balance — and handle claims professionally.",
    fastTrack: "RFI = info (am I exploring?). RFQ = quote (price for known scope). RFP = proposal (how would you do it?). FFP = clear scope, seller risk. CR = scope unclear, buyer risk. T&M = small/short engagements.",
    plainEnglish:
      "Procurement is risk allocation in writing. The contract type you pick decides who pays when scope slips, who profits when efficiency wins, and how disputes get resolved.",
    nexusCoachNotes: [
      "Buyer = the party paying for the work. Seller = the party doing the work.",
      "Procurement Statement of Work (SOW) describes what the seller delivers; PWS/SOO are alternatives.",
      "Source selection criteria are usually defined BEFORE proposals arrive, to keep evaluation fair.",
      "Claims administration is a defined process (it is NOT just litigation) — claims may settle by negotiation, ADR, then litigation as last resort.",
    ],
    drills: ["RFI/RFQ/RFP triage", "Contract type selection caselets", "Claim path roleplay"],
    examTraps: ["Penalizing seller before checking the agreement", "Using FFP for unclear scope (sets the project up to fight)"],
  },
  {
    id: "agile-hybrid-delivery",
    week: "Sprint 4",
    title: "Agile, Scaled Agile, and Hybrid Decisions",
    domain: "Process",
    estimateHours: 3,
    outcome: "Learner can choose between team coaching, product owner collaboration, backlog refinement, and governance escalation across Scrum, Kanban, XP, and scaled frameworks.",
    fastTrack: "Scrum events: Sprint Planning → Daily Scrum → Sprint Review → Sprint Retrospective (+ Backlog Refinement). Roles: Product Owner, Scrum Master, Developers. Servant leadership > command.",
    plainEnglish:
      "Agile is not chaos and predictive is not bureaucracy. Hybrid work means matching control style to uncertainty, risk, and decision speed.",
    nexusCoachNotes: [
      "Protect transparency, frequent inspection, adaptation.",
      "Let product decisions sit with product ownership roles. PM/SM facilitates.",
      "Kanban: visualize work, limit WIP, manage flow, make policies explicit, feedback loops, improve collaboratively.",
      "Hybrid: use predictive for compliance/regulated parts and agile for discovery/build parts.",
    ],
    drills: ["Scrum anti-pattern spotting", "Hybrid governance caselets", "WIP limit calibration"],
    examTraps: ["Commanding self-managing teams", "Freezing backlog learning too early"],
  },
  {
    id: "business-environment",
    week: "Sprint 5",
    title: "Business Environment, Benefits, OCM, Compliance",
    domain: "Business Environment",
    estimateHours: 2,
    outcome: "Learner can connect project decisions to benefits realization, organizational change management (OCM), compliance, and strategic alignment.",
    fastTrack: "Project delivers OUTPUT → OCM drives ADOPTION → adoption produces OUTCOME → outcome creates BENEFIT → benefit creates VALUE.",
    plainEnglish:
      "The project is not successful just because the checklist is complete. It succeeds when the organization can use the outcome to create the intended value.",
    nexusCoachNotes: [
      "Benefits Management Plan: who owns each benefit, how it’s measured, and when it’s expected to appear.",
      "OCM: ADKAR (Awareness, Desire, Knowledge, Ability, Reinforcement) is a common model.",
      "Compliance constraints must be built into planning, not bolted on later.",
    ],
    drills: ["Benefit owner mapping", "Compliance impact scenarios", "OCM gap analysis"],
    examTraps: ["Optimizing delivery while losing business value", "Ignoring adoption readiness"],
  },
  {
    id: "ai-sustainability-2026",
    week: "Sprint 5",
    title: "2026 Readiness — AI in PM, Sustainability, Ethics",
    domain: "Business Environment",
    estimateHours: 1.5,
    outcome: "Learner can reason about AI-assisted PM responsibly (governance, data privacy, bias), sustainability/ESG impact of projects, and PMI Code of Ethics in scenarios.",
    fastTrack: "Treat AI as a stakeholder + risk + tool — never let it remove human accountability. Sustainability = triple bottom line (people/planet/profit). Ethics = Responsibility, Respect, Fairness, Honesty.",
    plainEnglish:
      "PMP 2026 cares more about value, outcomes, AI awareness, and sustainability than the old ITTO grind. Andromeda treats these as part of risk + stakeholder + governance, not separate science.",
    nexusCoachNotes: [
      "AI in PM use cases: forecasting, risk identification, status reporting, decision support — always with a human-in-the-loop.",
      "Data privacy and bias are now project risks, not just IT problems.",
      "Sustainability shows up in scope (ESG criteria), procurement (vendor ESG), and benefits (long-term outcomes).",
    ],
    drills: ["AI-in-PM scenario judgment", "ESG-in-scope caselets", "Ethics dilemmas using PMI Code"],
    examTraps: ["Treating AI output as authoritative without review", "Ignoring sustainability in benefits discussion"],
  },
  {
    id: "simulation-readiness",
    week: "Sprint 6",
    title: "4-Hour Simulation Endurance + Remediation",
    domain: "Mixed",
    estimateHours: 4,
    outcome: "Learner can manage timing, fatigue, flagged questions, and post-simulation remediation with Andromeda.",
    fastTrack: "180 questions in 230 min = ~76 sec/question. Use 3 blocks of 60Q with two short breaks. Flag, don’t freeze. Review wrong answers BY TRAP TYPE, not by topic.",
    plainEnglish:
      "Exam endurance is a skill. You are training your decision rhythm as much as your knowledge.",
    nexusCoachNotes: [
      "Use the flag feature for uncertainty, not avoidance.",
      "Protect pacing in each 60-question block.",
      "After the sim, paste your trap log to the Diagnostic tab and let Andromeda explain the cluster.",
    ],
    drills: ["Timed 60-question block", "Wrong-answer trap log", "Fatigue drop review"],
    examTraps: ["Overthinking early questions", "Changing answers without new evidence"],
  },
];

export function totalCourseHours() {
  return Math.round(PMP_NEXUS_COURSE.reduce((sum, lesson) => sum + lesson.estimateHours, 0));
}

export function fastTrackPlan() {
  return {
    totalHours: totalCourseHours(),
    fastestTrackDays: 14,
    moderatePaceDays: 30,
    sustainablePaceDays: 45,
    dailyCommitment: "~2 jam fokus / hari + 1 drill block 30 menit setiap akhir minggu.",
  };
}

export const PMP_SIMULATION_BANK: PmpSimulationQuestion[] = [
  {
    id: "NEX-PMP-001",
    domain: "People",
    approach: "Agile",
    difficulty: "Above_Target",
    scenario:
      "A retail analytics team is halfway through an iteration when two senior developers begin arguing about the technical approach during the daily sync. The discussion is making junior members quiet, and the product owner is worried the conflict will slow a regulatory dashboard. What should the project lead do NEXT?",
    options: {
      A: "Facilitate a focused conversation with the developers and team to surface concerns, agree on decision criteria, and protect respectful collaboration.",
      B: "Tell the more experienced developer to choose the design so the team can keep moving.",
      C: "Escalate the conflict to the sponsor because the dashboard has regulatory visibility.",
      D: "Document the disagreement as a performance issue and replace one developer after the iteration.",
    },
    correctAnswer: "A",
    trap: "agile-command",
    explanation:
      "The best response protects psychological safety and helps the team make a transparent technical decision. The other options command, escalate, or punish before understanding the conflict.",
  },
  {
    id: "NEX-PMP-002",
    domain: "Process",
    approach: "Hybrid",
    difficulty: "Target",
    scenario:
      "A construction software integration project has a fixed compliance milestone, but the client requests a new reporting view after seeing an early demo. The team believes the change may affect testing effort and release timing. What should the project manager do FIRST?",
    options: {
      A: "Assess the impact on scope, schedule, cost, risk, and compliance before recommending whether to approve the change.",
      B: "Approve the view because the client saw the demo and clarified what they need.",
      C: "Reject the request because the milestone is fixed and changes should wait for phase two.",
      D: "Ask the steering committee to decide immediately whether the client request matters.",
    },
    correctAnswer: "A",
    trap: "firefighter",
    explanation:
      "A hybrid change still needs impact analysis before approval, rejection, or escalation. The correct move keeps value visible while protecting delivery constraints.",
  },
  {
    id: "NEX-PMP-003",
    domain: "Business Environment",
    approach: "Predictive",
    difficulty: "Target",
    scenario:
      "A hospital operations project delivered its scheduling tool on time, but department managers say adoption is low because staff were not prepared for new workflows. The sponsor asks why the expected efficiency benefit has not appeared. What should the project manager have done to PREVENT this?",
    options: {
      A: "Plan benefit adoption activities with operational stakeholders, including readiness, communication, and ownership for post-launch measurement.",
      B: "Wait until go-live to collect user feedback because adoption can only be measured after deployment.",
      C: "Ask the sponsor to mandate usage across all departments as soon as the tool launches.",
      D: "Close the project once the tool is delivered because benefits belong outside project work.",
    },
    correctAnswer: "A",
    trap: "none",
    explanation:
      "Benefits need adoption planning and ownership. Delivery alone does not guarantee business value.",
  },
  {
    id: "NEX-PMP-004",
    domain: "Process",
    approach: "Agile",
    difficulty: "Above_Target",
    scenario:
      "A fintech product owner keeps adding urgent backlog items directly into the active sprint. Developers are frustrated because the sprint goal is becoming unclear, but the product owner says market pressure is high. What should the project lead do NEXT?",
    options: {
      A: "Coach the product owner and team on protecting the sprint goal, then facilitate agreement on how urgent work will be evaluated.",
      B: "Allow all urgent items because agile teams should respond to change at any time.",
      C: "Escalate the product owner behavior to senior leadership.",
      D: "Lock the backlog for the rest of the project to restore predictability.",
    },
    correctAnswer: "A",
    trap: "scope-rigidity",
    explanation:
      "The best answer balances agility with focus. It uses coaching and team agreement instead of uncontrolled churn or rigid freezing.",
  },
  {
    id: "NEX-PMP-005",
    domain: "People",
    approach: "Predictive",
    difficulty: "Target",
    scenario:
      "A vendor implementation lead misses two planning workshops, and internal stakeholders start questioning the vendor's commitment. The contract includes collaboration expectations but no breach has been confirmed. What should the project manager do FIRST?",
    options: {
      A: "Meet with the vendor lead to understand the cause, confirm expectations, and agree on a recovery plan aligned with the contract.",
      B: "Issue a formal penalty notice immediately to show the vendor the behavior is unacceptable.",
      C: "Ask the sponsor to replace the vendor before the schedule is affected.",
      D: "Remove the vendor from planning and let the internal team make all decisions.",
    },
    correctAnswer: "A",
    trap: "escalation",
    explanation:
      "The manager should diagnose and collaborate using the agreement as a reference before penalties, replacement, or unilateral action.",
  },
  {
    id: "NEX-PMP-006",
    domain: "Process",
    approach: "Hybrid",
    difficulty: "Above_Target",
    scenario:
      "A manufacturing automation project discovers a recurring defect during pilot testing. The team proposes a quick fix, but the same defect appeared in two previous builds. What should the project manager do NEXT?",
    options: {
      A: "Lead root-cause analysis with the team, update quality controls, and then plan the corrective action.",
      B: "Apply the quick fix immediately because the pilot schedule is at risk.",
      C: "Escalate to the sponsor so they can decide whether quality or schedule matters more.",
      D: "Accept the defect as a known limitation because it appeared in previous builds.",
    },
    correctAnswer: "A",
    trap: "firefighter",
    explanation:
      "Recurring defects indicate a system issue. Root-cause analysis and quality control updates prevent repeated rework.",
  },
  {
    id: "NEX-PMP-007",
    domain: "People",
    approach: "Agile",
    difficulty: "Target",
    scenario:
      "A new team member is consistently quiet during retrospectives but sends thoughtful improvement ideas privately afterward. The team misses opportunities to discuss these ideas together. What should the project lead do NEXT?",
    options: {
      A: "Create a safer facilitation format that allows the team member and others to contribute ideas comfortably during the retrospective.",
      B: "Read the private messages aloud in the next retrospective so the team can discuss them.",
      C: "Tell the team member that speaking up publicly is required on agile teams.",
      D: "Ask the functional manager to coach the team member on communication confidence.",
    },
    correctAnswer: "A",
    trap: "agile-command",
    explanation:
      "The leader improves the environment rather than forcing behavior or exposing private feedback.",
  },
  {
    id: "NEX-PMP-008",
    domain: "Business Environment",
    approach: "Hybrid",
    difficulty: "Above_Target",
    scenario:
      "A logistics modernization project remains on budget, but a new regulation changes how customer data must be retained. The team can still deliver the original scope, but the product may become noncompliant soon after launch. What should the project manager do FIRST?",
    options: {
      A: "Assess compliance impact with relevant experts and stakeholders, then recommend the needed path through governance.",
      B: "Continue with the approved scope because compliance changed after the baseline was agreed.",
      C: "Stop all work until the sponsor personally rewrites the project objectives.",
      D: "Ask the development team to add retention features without formal review.",
    },
    correctAnswer: "A",
    trap: "scope-rigidity",
    explanation:
      "External business changes can affect project value and viability. The first move is informed impact analysis, not ignoring, stopping, or informal scope expansion.",
  },
  {
    id: "NEX-PMP-009",
    domain: "Process",
    approach: "Predictive",
    difficulty: "Target",
    scenario:
      "During acceptance testing, users report that a reporting feature meets the written requirement but does not support a key monthly workflow. The workflow was discussed informally but never captured. What should the project manager do NEXT?",
    options: {
      A: "Review the requirement gap with users and the team, analyze change impact, and follow the agreed change process.",
      B: "Tell users the feature is complete because it matches the approved requirement.",
      C: "Direct the team to rebuild the report immediately to protect customer satisfaction.",
      D: "Escalate to the sponsor to decide whether undocumented needs count.",
    },
    correctAnswer: "A",
    trap: "firefighter",
    explanation:
      "The situation needs collaborative clarification and change impact analysis. The other answers are too rigid, reactive, or premature.",
  },
  {
    id: "NEX-PMP-010",
    domain: "People",
    approach: "Hybrid",
    difficulty: "Above_Target",
    scenario:
      "A data migration project includes a business analyst from operations who keeps challenging technical estimates in front of executives. Engineers feel undermined, while executives appreciate the analyst's urgency. What should the project manager do NEXT?",
    options: {
      A: "Meet with the analyst and technical leads to clarify estimation assumptions and agree how concerns will be raised constructively.",
      B: "Remove the analyst from executive meetings to protect the engineering team.",
      C: "Ask executives to tell the analyst to stop questioning estimates.",
      D: "Let the disagreement continue because transparency is always beneficial.",
    },
    correctAnswer: "A",
    trap: "escalation",
    explanation:
      "The best move preserves transparency while repairing collaboration and decision quality.",
  },
  {
    id: "NEX-PMP-011",
    domain: "Process",
    approach: "Agile",
    difficulty: "Target",
    scenario:
      "A team's cycle time has increased for three weeks. Developers say work is stuck waiting for security review, but no one has visualized the delay. What should the project lead do FIRST?",
    options: {
      A: "Make the workflow and queues visible with the team, then inspect where work is blocked and agree on improvement experiments.",
      B: "Add more developers so the team can complete more work despite the review delay.",
      C: "Tell security reviewers they must approve items faster.",
      D: "Escalate the bottleneck to the sponsor as a resource conflict.",
    },
    correctAnswer: "A",
    trap: "firefighter",
    explanation:
      "Flow problems should be made visible before corrective action. Adding people or escalating may not address the constraint.",
  },
  {
    id: "NEX-PMP-012",
    domain: "Business Environment",
    approach: "Predictive",
    difficulty: "Target",
    scenario:
      "A regional training rollout is complete, but customer service metrics have not improved. Team members say attendance was high, but supervisors did not reinforce the new process after training. What should the project manager have planned earlier?",
    options: {
      A: "A transition and reinforcement plan with operational owners who would sustain behavior change after training.",
      B: "A larger training room so more employees could attend each session.",
      C: "A sponsor announcement requiring every employee to remember the training.",
      D: "A stricter project closeout checklist focused on training completion.",
    },
    correctAnswer: "A",
    trap: "none",
    explanation:
      "Business outcomes require adoption support. Attendance is an output, not proof that benefits are being realized.",
  },
];
