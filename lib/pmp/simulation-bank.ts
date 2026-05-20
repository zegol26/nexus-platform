import type { PmpSimulationQuestion } from "./course";

type Trap = "escalation" | "firefighter" | "agile-command" | "scope-rigidity" | "none";
type Domain = "People" | "Process" | "Business Environment";
type Approach = "Agile" | "Hybrid" | "Predictive";
type Difficulty = "Target" | "Above_Target";

type ScenarioTemplate = {
  domain: Domain;
  trap: Trap;
  approach: Approach;
  difficulty: Difficulty;
  // {industry} {role} {urgency} are interpolated
  scenario: string;
  best: string;
  reactiveDistractor: string;
  escalationDistractor: string;
  rigidDistractor: string;
  explanation: string;
};

const INDUSTRIES = [
  "fintech",
  "healthcare",
  "manufacturing",
  "retail analytics",
  "construction",
  "logistics",
  "telecom",
  "e-commerce",
  "energy",
  "education",
  "government",
  "automotive",
  "media streaming",
  "insurance",
  "biotech",
  "real estate",
  "agriculture tech",
  "travel platform",
  "gaming studio",
  "professional services",
];

const ROLES = [
  "product owner",
  "senior developer",
  "team lead",
  "vendor lead",
  "QA manager",
  "business analyst",
  "compliance officer",
  "infrastructure lead",
  "support manager",
  "data engineer",
  "security architect",
  "operations director",
  "design lead",
  "release manager",
];

const URGENCIES = [
  "high-visibility",
  "regulatory",
  "customer-impacting",
  "board-reported",
  "compliance-bound",
  "auditor-flagged",
  "time-critical",
];

// Templates intentionally focus on the PMI mindset patterns that PMP tests:
// diagnose-before-act, collaborate-before-escalate, value-driven, adaptive,
// no command-and-control. Each template gives one CLEARLY best response and
// three distractors that fall into the classic trap categories.
const TEMPLATES: ScenarioTemplate[] = [
  {
    domain: "People",
    trap: "agile-command",
    approach: "Agile",
    difficulty: "Above_Target",
    scenario:
      "A {industry} team is halfway through a sprint when two engineers begin arguing about the technical approach during the daily sync. A {role} worries the conflict will slow a {urgency} deliverable.",
    best: "Facilitate a focused conversation with the engineers and team to surface concerns, agree on decision criteria, and protect respectful collaboration.",
    reactiveDistractor: "Tell the senior engineer to pick the design so the team can keep moving.",
    escalationDistractor: "Escalate the disagreement to the sponsor because the deliverable is visible to leadership.",
    rigidDistractor: "Document the disagreement as a performance issue and remove one engineer after the sprint.",
    explanation:
      "The exam-safe response protects psychological safety and lets the team make a transparent technical decision. The other options command, escalate, or punish before understanding the conflict.",
  },
  {
    domain: "Process",
    trap: "firefighter",
    approach: "Hybrid",
    difficulty: "Target",
    scenario:
      "A {industry} integration project has a {urgency} milestone, but a {role} requests a new reporting view after seeing an early demo. The team believes the change may affect testing effort and timing.",
    best: "Assess the impact on scope, schedule, cost, risk, and compliance before recommending whether to approve the change.",
    reactiveDistractor: "Approve the view because the requester already saw the demo and clarified the need.",
    escalationDistractor: "Ask the steering committee to decide immediately whether the request matters.",
    rigidDistractor: "Reject the request because the milestone is fixed and changes must wait for phase two.",
    explanation:
      "Hybrid change still needs impact analysis before approval, rejection, or escalation. The correct move keeps value visible while protecting delivery constraints.",
  },
  {
    domain: "Business Environment",
    trap: "none",
    approach: "Predictive",
    difficulty: "Target",
    scenario:
      "A {industry} project delivered its scheduling tool on time, but a {role} says adoption is low because staff were not prepared for new workflows. The sponsor asks why the expected benefit has not appeared.",
    best: "Plan benefit adoption activities with operational stakeholders, including readiness, communication, and ownership for post-launch measurement.",
    reactiveDistractor: "Wait until go-live to collect user feedback because adoption can only be measured after deployment.",
    escalationDistractor: "Ask the sponsor to mandate usage across all departments immediately.",
    rigidDistractor: "Close the project once the tool is delivered because benefits belong outside project work.",
    explanation:
      "Benefits require adoption planning and ownership. Delivery alone does not guarantee business value.",
  },
  {
    domain: "Process",
    trap: "scope-rigidity",
    approach: "Agile",
    difficulty: "Above_Target",
    scenario:
      "A {industry} {role} keeps adding {urgency} backlog items directly into the active sprint. Developers are frustrated because the sprint goal is becoming unclear.",
    best: "Coach the product owner and team on protecting the sprint goal, then facilitate agreement on how urgent work will be evaluated.",
    reactiveDistractor: "Allow all urgent items because agile teams should respond to change at any time.",
    escalationDistractor: "Escalate the product owner behavior to senior leadership.",
    rigidDistractor: "Lock the backlog for the rest of the project to restore predictability.",
    explanation:
      "The best answer balances agility with focus. It uses coaching and team agreement instead of uncontrolled churn or rigid freezing.",
  },
  {
    domain: "People",
    trap: "escalation",
    approach: "Predictive",
    difficulty: "Target",
    scenario:
      "A {industry} {role} misses two planning workshops, and internal stakeholders start questioning their commitment. The contract includes collaboration expectations but no breach is confirmed.",
    best: "Meet with the vendor lead to understand the cause, confirm expectations, and agree on a recovery plan aligned with the contract.",
    reactiveDistractor: "Issue a formal penalty notice immediately to show the vendor the behavior is unacceptable.",
    escalationDistractor: "Ask the sponsor to replace the vendor before the schedule is affected.",
    rigidDistractor: "Remove the vendor from planning and let the internal team make all decisions.",
    explanation:
      "Diagnose and collaborate using the agreement as a reference before penalties, replacement, or unilateral action.",
  },
  {
    domain: "Process",
    trap: "firefighter",
    approach: "Hybrid",
    difficulty: "Above_Target",
    scenario:
      "A {industry} automation project discovers a recurring defect during pilot testing. The team proposes a quick fix, but the same defect appeared in two previous builds.",
    best: "Lead root-cause analysis with the team, update quality controls, and then plan the corrective action.",
    reactiveDistractor: "Apply the quick fix immediately because the pilot schedule is at risk.",
    escalationDistractor: "Escalate to the sponsor so they can decide whether quality or schedule matters more.",
    rigidDistractor: "Accept the defect as a known limitation because it appeared in previous builds.",
    explanation:
      "Recurring defects indicate a system issue. Root-cause analysis and quality control updates prevent repeated rework.",
  },
  {
    domain: "People",
    trap: "agile-command",
    approach: "Agile",
    difficulty: "Target",
    scenario:
      "A new {role} on a {industry} team is consistently quiet during retrospectives but sends thoughtful improvement ideas privately afterward. The team misses opportunities to discuss these ideas together.",
    best: "Create a safer facilitation format that allows the team member and others to contribute ideas comfortably during the retrospective.",
    reactiveDistractor: "Read the private messages aloud in the next retrospective so the team can discuss them.",
    escalationDistractor: "Tell the team member that speaking up publicly is required on agile teams.",
    rigidDistractor: "Ask the functional manager to coach the team member on communication confidence.",
    explanation:
      "The leader improves the environment rather than forcing behavior or exposing private feedback.",
  },
  {
    domain: "Business Environment",
    trap: "scope-rigidity",
    approach: "Hybrid",
    difficulty: "Above_Target",
    scenario:
      "A {industry} modernization project remains on budget, but a new regulation changes how customer data must be retained. The team can still deliver the original scope, but the product may become noncompliant soon after launch.",
    best: "Assess compliance impact with relevant experts and stakeholders, then recommend the needed path through governance.",
    reactiveDistractor: "Continue with the approved scope because compliance changed after the baseline was agreed.",
    escalationDistractor: "Stop all work until the sponsor personally rewrites the project objectives.",
    rigidDistractor: "Ask the development team to add retention features without formal review.",
    explanation:
      "External business changes can affect value and viability. The first move is informed impact analysis, not ignoring, stopping, or informal scope expansion.",
  },
  {
    domain: "Process",
    trap: "firefighter",
    approach: "Predictive",
    difficulty: "Target",
    scenario:
      "During acceptance testing on a {industry} project, users report that a reporting feature meets the written requirement but does not support a {urgency} monthly workflow. The workflow was discussed informally but never captured.",
    best: "Review the requirement gap with users and the team, analyze change impact, and follow the agreed change process.",
    reactiveDistractor: "Tell users the feature is complete because it matches the approved requirement.",
    escalationDistractor: "Escalate to the sponsor to decide whether undocumented needs count.",
    rigidDistractor: "Direct the team to rebuild the report immediately to protect customer satisfaction.",
    explanation:
      "The situation needs collaborative clarification and change impact analysis. The other answers are rigid, reactive, or premature.",
  },
  {
    domain: "People",
    trap: "escalation",
    approach: "Hybrid",
    difficulty: "Above_Target",
    scenario:
      "A {industry} data migration project includes a {role} who keeps challenging technical estimates in front of executives. Engineers feel undermined, while executives appreciate the urgency.",
    best: "Meet with the analyst and technical leads to clarify estimation assumptions and agree how concerns will be raised constructively.",
    reactiveDistractor: "Let the disagreement continue because transparency is always beneficial.",
    escalationDistractor: "Ask executives to tell the analyst to stop questioning estimates.",
    rigidDistractor: "Remove the analyst from executive meetings to protect the engineering team.",
    explanation:
      "The best move preserves transparency while repairing collaboration and decision quality.",
  },
  {
    domain: "Process",
    trap: "firefighter",
    approach: "Agile",
    difficulty: "Target",
    scenario:
      "A {industry} team's cycle time has increased for three weeks. Developers say work is stuck waiting for a {role}, but no one has visualized the delay.",
    best: "Make the workflow and queues visible with the team, then inspect where work is blocked and agree on improvement experiments.",
    reactiveDistractor: "Add more developers so the team can complete more work despite the review delay.",
    escalationDistractor: "Escalate the bottleneck to the sponsor as a resource conflict.",
    rigidDistractor: "Tell the reviewers they must approve items faster.",
    explanation:
      "Flow problems should be made visible before corrective action. Adding people or escalating may not address the constraint.",
  },
  {
    domain: "Business Environment",
    trap: "none",
    approach: "Predictive",
    difficulty: "Target",
    scenario:
      "A {industry} training rollout is complete, but customer service metrics have not improved. Team members say attendance was high, but a {role} did not reinforce the new process after training.",
    best: "Plan a transition and reinforcement plan with operational owners who would sustain behavior change after training.",
    reactiveDistractor: "Add a larger training room so more employees can attend each session.",
    escalationDistractor: "Ask the sponsor to require every employee to remember the training.",
    rigidDistractor: "Use a stricter project closeout checklist focused on training completion.",
    explanation:
      "Business outcomes require adoption support. Attendance is an output, not proof that benefits are being realized.",
  },
  {
    domain: "Process",
    trap: "firefighter",
    approach: "Predictive",
    difficulty: "Above_Target",
    scenario:
      "A {industry} project shows CPI = 0.85 and SPI = 0.78 at the 40% completion mark. A {role} is asking for crash funding to recover schedule.",
    best: "Analyze the variance drivers with the team and sponsor before approving any recovery investment.",
    reactiveDistractor: "Approve crash funding immediately because both indices are below 1.",
    escalationDistractor: "Hand the situation to the steering committee for a go/no-go decision.",
    rigidDistractor: "Ignore the indices because the project is still under 50% complete.",
    explanation:
      "EVM signals require diagnosis before action. Crashing without root-cause may waste budget on the wrong constraint.",
  },
  {
    domain: "Process",
    trap: "scope-rigidity",
    approach: "Predictive",
    difficulty: "Target",
    scenario:
      "A {industry} project has a {urgency} deadline. A {role} discovers a risk that has only recently appeared in similar projects and is not in the current risk register.",
    best: "Add the risk to the register, assess probability and impact, assign an owner, and plan an appropriate response.",
    reactiveDistractor: "Buy contingency reserve immediately and continue as planned.",
    escalationDistractor: "Notify the sponsor and let them decide whether to act.",
    rigidDistractor: "Ignore the risk because it has not yet impacted this project.",
    explanation:
      "Newly identified risks go through the full pipeline: register → analyze → owner → response. Bypassing analysis can either over- or under-respond.",
  },
  {
    domain: "Process",
    trap: "none",
    approach: "Predictive",
    difficulty: "Above_Target",
    scenario:
      "A {industry} project is about to issue a procurement document. The scope is partially defined and the team expects to learn more during execution. A {role} wants the most buyer-protective contract possible.",
    best: "Propose a cost-reimbursable contract (such as CPIF or CPAF) so risk is allocated to the buyer while keeping incentives for seller performance.",
    reactiveDistractor: "Force the seller to sign a firm fixed-price contract to push all risk onto them.",
    escalationDistractor: "Defer the contract decision to procurement leadership without recommending an approach.",
    rigidDistractor: "Use a time-and-materials contract with no cap to maximize buyer flexibility.",
    explanation:
      "Fuzzy scope + buyer protection = cost-reimbursable with incentives. FFP for unclear scope sets up disputes; uncapped T&M exposes the buyer.",
  },
  {
    domain: "Process",
    trap: "none",
    approach: "Predictive",
    difficulty: "Above_Target",
    scenario:
      "A {industry} procurement team is preparing to acquire a complex {urgency} integration service. They need vendor approaches plus team and methodology.",
    best: "Issue an RFP so sellers can propose how they will approach the integration, with multi-criteria evaluation.",
    reactiveDistractor: "Issue an RFQ so the team can compare prices quickly.",
    escalationDistractor: "Issue an RFI to ask vendors what they think the project should look like.",
    rigidDistractor: "Issue an IFB and pick the lowest sealed bid that meets minimum specs.",
    explanation:
      "Complex integration with required approach + team + methodology → RFP. RFQ is for known specs and price. RFI is informational only. IFB is sealed-bid for very clear scope.",
  },
  {
    domain: "People",
    trap: "agile-command",
    approach: "Agile",
    difficulty: "Above_Target",
    scenario:
      "A {industry} team has been Storming for two weeks. A {role} suggests reorganizing the team to break the conflict.",
    best: "Facilitate the team through Storming with coaching, working agreements, and conflict tools — reorganization is premature.",
    reactiveDistractor: "Reorganize the team immediately to remove the friction.",
    escalationDistractor: "Ask HR to assess team composition.",
    rigidDistractor: "Override the team and impose strict working norms.",
    explanation:
      "Storming is a normal Tuckman stage. Facilitation, not reorganization, moves the team to Norming.",
  },
  {
    domain: "Business Environment",
    trap: "none",
    approach: "Hybrid",
    difficulty: "Target",
    scenario:
      "A {industry} project will introduce an AI feature that automates an internal decision. A {role} flags that there is no defined accountability if the AI is wrong.",
    best: "Pause feature scope until human-in-the-loop, accountability, and audit logging are defined as part of governance.",
    reactiveDistractor: "Ship the feature now and adjust if problems appear.",
    escalationDistractor: "Ask legal to write a one-page disclaimer and continue.",
    rigidDistractor: "Drop the feature entirely to avoid governance complexity.",
    explanation:
      "AI features need defined accountability and human oversight. Shipping without governance violates 2026 readiness expectations.",
  },
  {
    domain: "Process",
    trap: "firefighter",
    approach: "Agile",
    difficulty: "Target",
    scenario:
      "Mid-sprint, a {industry} {role} notices a defect that bypasses the team's Definition of Done. A {urgency} demo is tomorrow.",
    best: "Surface the gap with the team, fix the defect within DoD, and decide demo content based on what truly meets DoD.",
    reactiveDistractor: "Demo the feature as-is and patch it after.",
    escalationDistractor: "Email stakeholders that the demo is cancelled.",
    rigidDistractor: "Reject the increment and skip the demo entirely.",
    explanation:
      "Definition of Done is non-negotiable. The team protects DoD while keeping the demo's commitment realistic.",
  },
  {
    domain: "People",
    trap: "agile-command",
    approach: "Agile",
    difficulty: "Target",
    scenario:
      "A {industry} {role} on a Scrum team begins assigning tasks to specific developers during sprint planning.",
    best: "Coach the team back to self-organization — let developers pull and commit to their own work.",
    reactiveDistractor: "Let the role continue assigning to save time.",
    escalationDistractor: "Tell the sponsor that the team is not following Scrum.",
    rigidDistractor: "Remove the role from sprint planning.",
    explanation:
      "Scrum teams are self-organizing. Coaching restores the practice without escalating or removing people.",
  },
  {
    domain: "Process",
    trap: "scope-rigidity",
    approach: "Hybrid",
    difficulty: "Target",
    scenario:
      "A {industry} project is using a hybrid approach. A {role} insists every change must pass through a 2-week CCB cycle even for spike work.",
    best: "Negotiate a tiered change control where lightweight changes follow a faster path while baseline-affecting changes follow the full CCB cycle.",
    reactiveDistractor: "Bypass CCB for all changes to keep agile flow.",
    escalationDistractor: "Escalate to the steering committee to overrule the role.",
    rigidDistractor: "Accept the 2-week cycle for everything to preserve compliance.",
    explanation:
      "Hybrid governance uses tiered control — preserve discipline for high-risk changes, accelerate for low-risk ones.",
  },
  {
    domain: "People",
    trap: "none",
    approach: "Predictive",
    difficulty: "Target",
    scenario:
      "On a {industry} project, salary increases were rolled out last month but team engagement remains low. A {role} is unsure why.",
    best: "Investigate intrinsic motivators (recognition, growth, autonomy) — salary is a hygiene factor that prevents dissatisfaction but does not drive motivation.",
    reactiveDistractor: "Add another round of bonuses.",
    escalationDistractor: "Escalate engagement metrics to HR leadership.",
    rigidDistractor: "Tell the team to focus on the work and stop complaining.",
    explanation:
      "Herzberg's Two-Factor: hygiene factors prevent dissatisfaction; motivators create motivation. Salary alone is not enough.",
  },
  {
    domain: "Process",
    trap: "none",
    approach: "Predictive",
    difficulty: "Above_Target",
    scenario:
      "A {industry} schedule is at risk. Two paths exist: one critical path activity can be accelerated by adding budgeted resources, or two sequential activities can be run in parallel with new integration risk.",
    best: "Evaluate both crashing and fast-tracking together with cost/risk trade-offs before choosing.",
    reactiveDistractor: "Fast-track immediately because it does not cost more.",
    escalationDistractor: "Defer the decision to the sponsor.",
    rigidDistractor: "Crash regardless of cost because risk is unacceptable.",
    explanation:
      "Schedule compression options have different cost-vs-risk trade-offs. Evaluation precedes selection.",
  },
  {
    domain: "Business Environment",
    trap: "none",
    approach: "Hybrid",
    difficulty: "Target",
    scenario:
      "A {industry} project's sponsor requested an ESG impact section in the business case. A {role} is unsure whether project decisions should weigh ESG.",
    best: "Treat ESG factors as project criteria (vendor selection, scope, benefits) — integrate them into normal decision-making, not as a separate concern.",
    reactiveDistractor: "Hand ESG to a separate function and continue normal planning.",
    escalationDistractor: "Wait for the sponsor to define ESG before doing anything.",
    rigidDistractor: "Refuse to include ESG because it is not project-controlled.",
    explanation:
      "PMP 2026 readiness expects ESG to be part of normal project decisions, especially vendor selection and benefits.",
  },
  {
    domain: "Process",
    trap: "scope-rigidity",
    approach: "Predictive",
    difficulty: "Above_Target",
    scenario:
      "A {industry} project's seller delivers work that technically meets the Statement of Work, but a {role} feels it is below quality expectations.",
    best: "Review the agreement, document the quality gap with evidence, and initiate claims administration through good-faith negotiation first.",
    reactiveDistractor: "Withhold final payment until the seller redoes the work.",
    escalationDistractor: "Escalate to legal immediately for litigation.",
    rigidDistractor: "Accept the deliverable because it meets the written SOW.",
    explanation:
      "Claims start with documentation and negotiation. Litigation is last resort. Pure SOW acceptance without addressing quality gap is also wrong.",
  },
  {
    domain: "People",
    trap: "none",
    approach: "Predictive",
    difficulty: "Target",
    scenario:
      "A {industry} stakeholder grid shows a {role} as Low Power / High Interest. They are vocal in user forums.",
    best: "Keep them informed proactively and channel their interest into useful project input (e.g., user testing, beta feedback).",
    reactiveDistractor: "Reduce communication to focus on high-power stakeholders only.",
    escalationDistractor: "Ask the sponsor to silence the user forum.",
    rigidDistractor: "Treat the role exactly like other low-power stakeholders.",
    explanation:
      "Low Power / High Interest = Keep Informed. Channel their interest constructively, do not suppress it.",
  },
  {
    domain: "Process",
    trap: "firefighter",
    approach: "Predictive",
    difficulty: "Target",
    scenario:
      "A {industry} {role} reports that a key risk's trigger has appeared. The pre-planned response has not been used yet.",
    best: "Execute the pre-planned risk response and update the risk register and report.",
    reactiveDistractor: "Wait to see whether the risk truly materializes before acting.",
    escalationDistractor: "Notify the sponsor and request guidance.",
    rigidDistractor: "Switch to a different response that the team prefers now.",
    explanation:
      "When a trigger fires, execute the planned response. Hesitating defeats the purpose of risk planning; switching response without analysis adds risk.",
  },
  {
    domain: "Business Environment",
    trap: "none",
    approach: "Predictive",
    difficulty: "Above_Target",
    scenario:
      "A {industry} program's benefits register lists three benefits but none have named owners after project closure.",
    best: "Assign benefit owners in operations, agree on measurement cadence, and transition the benefits management plan to operations.",
    reactiveDistractor: "Close the project and let benefits emerge naturally.",
    escalationDistractor: "Hand the benefits register to the sponsor with no further action.",
    rigidDistractor: "Add another month to the project timeline to monitor benefits.",
    explanation:
      "Benefits need named owners and a measurement plan that lives beyond project closure.",
  },
  {
    domain: "People",
    trap: "agile-command",
    approach: "Agile",
    difficulty: "Above_Target",
    scenario:
      "On a {industry} agile team, a senior {role} from another department joins as observer and starts giving direct technical instructions to developers.",
    best: "Privately clarify the observer's role and re-establish that decisions belong with the team and product owner.",
    reactiveDistractor: "Let the observer continue to maintain organizational politeness.",
    escalationDistractor: "Email the observer's manager about the boundary issue.",
    rigidDistractor: "Remove the observer from team meetings.",
    explanation:
      "Boundaries are restored through private conversation first. Escalation and removal are unnecessary if a clarifying chat works.",
  },
  {
    domain: "Process",
    trap: "firefighter",
    approach: "Predictive",
    difficulty: "Target",
    scenario:
      "A {industry} quality audit on a {urgency} project finds a process gap. A {role} wants the team to add a one-time workaround.",
    best: "Address the process gap through root-cause analysis and update standards, then verify with the next audit.",
    reactiveDistractor: "Add the workaround and continue without revisiting the process.",
    escalationDistractor: "Defer audit findings until the sponsor approves remediation budget.",
    rigidDistractor: "Reject the audit finding as not material.",
    explanation:
      "Audits surface process issues. Workarounds without fixing the system invite repeat findings.",
  },
];

function rngFromString(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  }
  return function next() {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h = (h ^ (h >>> 16)) >>> 0;
    return h / 4294967296;
  };
}

function pick<T>(arr: readonly T[], rng: () => number) {
  return arr[Math.floor(rng() * arr.length)];
}

function shuffle4<T>(items: T[], rng: () => number): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const TARGET_COUNT = 1020;

function buildBank(): PmpSimulationQuestion[] {
  const bank: PmpSimulationQuestion[] = [];
  let serial = 0;
  for (let i = 0; i < TARGET_COUNT; i++) {
    const template = TEMPLATES[i % TEMPLATES.length];
    const seed = `NEX-PMP-AUTO-${i}`;
    const rng = rngFromString(seed);
    const industry = pick(INDUSTRIES, rng);
    const role = pick(ROLES, rng);
    const urgency = pick(URGENCIES, rng);

    const scenario = template.scenario
      .replaceAll("{industry}", industry)
      .replaceAll("{role}", role)
      .replaceAll("{urgency}", urgency);

    // Shuffle option order so the correct answer is not always A.
    const labeled = [
      { text: template.best, isCorrect: true, kind: "best" as const },
      { text: template.reactiveDistractor, isCorrect: false, kind: "reactive" as const },
      { text: template.escalationDistractor, isCorrect: false, kind: "escalation" as const },
      { text: template.rigidDistractor, isCorrect: false, kind: "rigid" as const },
    ];
    const shuffled = shuffle4(labeled, rng);
    const letters = ["A", "B", "C", "D"] as const;
    const options: Record<"A" | "B" | "C" | "D", string> = {
      A: shuffled[0].text,
      B: shuffled[1].text,
      C: shuffled[2].text,
      D: shuffled[3].text,
    };
    const correctIndex = shuffled.findIndex((opt) => opt.isCorrect);
    const correctAnswer = letters[correctIndex];

    serial += 1;
    bank.push({
      id: `NEX-PMP-AUTO-${String(serial).padStart(4, "0")}`,
      domain: template.domain,
      approach: template.approach,
      difficulty: template.difficulty,
      scenario,
      options,
      correctAnswer,
      trap: template.trap,
      explanation: template.explanation,
    });
  }
  return bank;
}

export const GENERATED_SIMULATION_BANK: ReadonlyArray<PmpSimulationQuestion> = buildBank();

/**
 * Pick `length` questions for a given attempt number, ensuring that the same
 * question repeats at most once every 5 attempts (when the bank is large enough
 * to support that rotation). The seed is derived from the attempt number so the
 * order is stable per attempt.
 */
export function pickAttemptQuestions(
  bank: ReadonlyArray<PmpSimulationQuestion>,
  length: number,
  attemptNumber: number
): PmpSimulationQuestion[] {
  if (bank.length === 0 || length <= 0) return [];
  const safeLength = Math.min(length, bank.length);
  // Slice window so attempts 1..5 cover disjoint chunks before repeating.
  const stride = Math.max(safeLength, Math.floor(bank.length / 5));
  const start = ((attemptNumber - 1) * stride) % bank.length;
  const window: PmpSimulationQuestion[] = [];
  for (let i = 0; i < safeLength; i++) {
    window.push(bank[(start + i) % bank.length]);
  }
  // Shuffle the order within the window deterministically.
  const rng = rngFromString(`attempt-${attemptNumber}-len-${length}`);
  const shuffled = window.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // Reassign sequential ids so navigator buttons stay 1..N.
  return shuffled.map((q, index) => ({
    ...q,
    id: `${q.id}-T${attemptNumber}-${String(index + 1).padStart(3, "0")}`,
  }));
}
