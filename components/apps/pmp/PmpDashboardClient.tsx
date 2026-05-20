"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PMP_NEXUS_COURSE, totalCourseHours, type PmpSimulationQuestion } from "@/lib/pmp/course";
import { GENERATED_SIMULATION_BANK, pickAttemptQuestions } from "@/lib/pmp/simulation-bank";
import { AndromedaChat } from "./AndromedaChat";
import { AndromedaIcon } from "./AndromedaIcon";
import { PmpDisclaimerBanner } from "./PmpDisclaimerBanner";
import { PmpReadinessChecklist } from "./PmpReadinessChecklist";
import { PmpBrainDumps } from "./PmpBrainDumps";

type WorkspaceMode = "course" | "simulator" | "andromeda" | "diagnostic" | "brain-dump";
type AnswerMap = Record<number, "A" | "B" | "C" | "D" | undefined>;
type LessonStatus = "not_started" | "in_progress" | "completed";

const examLengthOptions = [30, 60, 180];

const ATTEMPT_STORAGE_KEY = "pmp-simulation-attempt";

function formatTimer(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return [hours, minutes, rest].map((part) => String(part).padStart(2, "0")).join(":");
}

function loadAttempt(): number {
  if (typeof window === "undefined") return 1;
  const stored = Number(window.localStorage.getItem(ATTEMPT_STORAGE_KEY));
  return Number.isFinite(stored) && stored > 0 ? stored : 1;
}

function saveAttempt(n: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ATTEMPT_STORAGE_KEY, String(n));
}

export function PmpDashboardClient() {
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("course");
  const [selectedLessonId, setSelectedLessonId] = useState(PMP_NEXUS_COURSE[0]?.id ?? "");
  const [examLength, setExamLength] = useState(60);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [diagnosticReport, setDiagnosticReport] = useState("");
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const [diagnosticError, setDiagnosticError] = useState("");

  // Progress state.
  const [lessonProgress, setLessonProgress] = useState<Record<string, LessonStatus>>({});
  const [progressSnapshot, setProgressSnapshot] = useState<{
    completedLessons: number;
    totalLessons: number;
    percentComplete: number;
    readinessPercent: number;
    overallPercent: number;
  } | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setAttemptNumber(loadAttempt());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const simulationQuestions = useMemo<PmpSimulationQuestion[]>(() => {
    return pickAttemptQuestions(GENERATED_SIMULATION_BANK, examLength, attemptNumber);
  }, [examLength, attemptNumber]);

  const currentQuestion = simulationQuestions[questionIndex];
  const selectedLesson =
    PMP_NEXUS_COURSE.find((lesson) => lesson.id === selectedLessonId) ?? PMP_NEXUS_COURSE[0];

  const answeredCount = simulationQuestions.filter((_, index) => answers[index]).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const score = simulationQuestions.reduce(
    (total, question, index) => total + (answers[index] === question.correctAnswer ? 1 : 0),
    0
  );
  const scoreOnAnswered = answeredCount === 0 ? 0 : Math.round((score / answeredCount) * 100);
  const overallScore = Math.round((score / simulationQuestions.length) * 100);

  useEffect(() => {
    if (workspaceMode !== "simulator" || submitted) return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [submitted, workspaceMode]);

  const refreshProgress = useCallback(async () => {
    try {
      const res = await fetch("/api/apps/pmp/progress", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const map: Record<string, LessonStatus> = {};
      for (const lp of data.lessons ?? []) {
        if (lp.status === "completed" || lp.status === "in_progress" || lp.status === "not_started") {
          map[lp.lessonId] = lp.status;
        }
      }
      setLessonProgress(map);
      setProgressSnapshot(data.snapshot ?? null);
    } catch {
      // silent fail — progress is non-blocking
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/apps/pmp/progress", { cache: "no-store" });
        if (cancelled || !res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const map: Record<string, LessonStatus> = {};
        for (const lp of data.lessons ?? []) {
          if (
            lp.status === "completed" ||
            lp.status === "in_progress" ||
            lp.status === "not_started"
          ) {
            map[lp.lessonId] = lp.status;
          }
        }
        setLessonProgress(map);
        setProgressSnapshot(data.snapshot ?? null);
      } catch {
        // silent
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateLessonStatus = useCallback(
    async (lessonId: string, status: LessonStatus) => {
      setLessonProgress((prev) => ({ ...prev, [lessonId]: status }));
      try {
        await fetch("/api/apps/pmp/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId, status }),
        });
        refreshProgress();
      } catch {
        // silent fail
      }
    },
    [refreshProgress]
  );

  // Auto-mark lesson as in_progress when first viewed.
  useEffect(() => {
    if (!selectedLesson) return;
    const current = lessonProgress[selectedLesson.id];
    if (current) return;
    const timer = window.setTimeout(() => {
      updateLessonStatus(selectedLesson.id, "in_progress");
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLessonId]);

  function resetSimulation(length = examLength, incrementAttempt = false) {
    if (incrementAttempt) {
      const next = attemptNumber + 1;
      setAttemptNumber(next);
      saveAttempt(next);
    }
    setExamLength(length);
    setQuestionIndex(0);
    setAnswers({});
    setFlagged({});
    setSubmitted(false);
    setElapsedSeconds(0);
    setDiagnosticReport("");
  }

  function answerCurrent(choice: "A" | "B" | "C" | "D") {
    if (submitted) return;
    setAnswers((current) => ({ ...current, [questionIndex]: choice }));
  }

  function simulationRecords() {
    return simulationQuestions.map((question, index) => ({
      question: index + 1,
      domain: question.domain,
      chosen: answers[index] ?? "",
      correct: question.correctAnswer,
      trap: answers[index] && answers[index] !== question.correctAnswer ? question.trap : "",
      timeSeconds: Math.round(elapsedSeconds / Math.max(1, answeredCount || 1)),
    }));
  }

  async function analyzeFromSimulator() {
    setDiagnosticLoading(true);
    setDiagnosticError("");
    try {
      const res = await fetch("/api/apps/pmp/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: simulationRecords() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Diagnostic failed");
      setDiagnosticReport(data.report);
      setWorkspaceMode("diagnostic");
    } catch (err) {
      setDiagnosticError(err instanceof Error ? err.message : "Diagnostic failed");
    } finally {
      setDiagnosticLoading(false);
    }
  }

  const isAnswered = Boolean(answers[questionIndex]);
  const currentIsCorrect =
    submitted && isAnswered && answers[questionIndex] === currentQuestion?.correctAnswer;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PmpDisclaimerBanner />

      <section className="overflow-hidden rounded-2xl border border-violet-300/15 bg-gradient-to-br from-slate-950 via-violet-950/40 to-cyan-950/30 shadow-2xl shadow-violet-950/30">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <AndromedaIcon size={42} className="drop-shadow-[0_0_20px_rgba(167,139,250,0.7)]" />
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-fuchsia-200">
                PMP Nexus Academy
              </p>
            </div>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Fast-track PMP prep, guided by{" "}
              <span className="bg-gradient-to-r from-fuchsia-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
                Andromeda
              </span>
              .
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
              Andromeda — instructor AI ber-PhD Management & Project Management — jadi otak dari
              kurikulum, Knowledge Areas, glossary, ITTO, lesson, dan simulation test. Belajar fokus,
              scenario-based, integrating teori (Pareto, fishbone, Maslow, Tuckman, Thomas-Kilmann,
              EVM) langsung ke decision pattern PMP.
            </p>
          </div>
          <div className="border-t border-white/10 bg-slate-900/70 p-6 lg:border-l lg:border-t-0 lg:p-8">
            <div className="grid grid-cols-3 gap-3">
              <Metric label="Course lessons" value={PMP_NEXUS_COURSE.length} />
              <Metric label="Est. hours" value={`~${totalCourseHours()}h`} />
              <Metric label="Sim bank" value={`${GENERATED_SIMULATION_BANK.length}+`} />
            </div>
            <div className="mt-5 grid gap-2 text-sm text-slate-300">
              <p>✦ Original Nexus content — bukan kopian PMI/PMBOK.</p>
              <p>✦ Andromeda jawab comprehensive: ITTO + KA + mindset + teori.</p>
              <p>✦ Simulator: {GENERATED_SIMULATION_BANK.length}+ Q, rotasi 1:5 antar attempt.</p>
            </div>
          </div>
        </div>
      </section>

      {progressSnapshot && (
        <ProgressStrip snapshot={progressSnapshot} />
      )}

      <nav className="grid gap-2 rounded-2xl border border-white/10 bg-slate-900 p-2 sm:grid-cols-5">
        {(
          [
            ["course", "Course"],
            ["simulator", "Simulator"],
            ["andromeda", "Andromeda ✦"],
            ["brain-dump", "Brain Dump"],
            ["diagnostic", "Diagnostic"],
          ] as const
        ).map(([key, label]) => {
          const isAndromeda = key === "andromeda";
          const isActive = workspaceMode === key;
          return (
            <button
              key={key}
              onClick={() => setWorkspaceMode(key)}
              className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                isActive
                  ? isAndromeda
                    ? "bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 text-slate-950"
                    : "bg-cyan-300 text-slate-950"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              {label}
            </button>
          );
        })}
      </nav>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          [
            "ITTO Explorer",
            "/apps/pmp/itto",
            "5 Process Groups × 10 Knowledge Areas, with Andromeda's notes on every process.",
          ],
          [
            "PMP Glossary",
            "/apps/pmp/glossary",
            "200+ terms with PMIism notes, contract types, procurement docs, and Andromeda's mindset hooks.",
          ],
          [
            "Knowledge Base",
            "/apps/pmp/knowledge-base",
            "Procurement (RFI/RFQ/RFP, all contract types), risk strategies, quality tools, EVM, agile, hybrid, AI & sustainability — comprehensive.",
          ],
        ].map(([title, href, description]) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl border border-white/10 bg-slate-900 p-5 transition hover:border-fuchsia-300/40"
          >
            <h2 className="font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
          </Link>
        ))}
      </section>

      {workspaceMode === "course" && selectedLesson && (
        <section className="space-y-5">
          <FastTrackPanel />

          <PmpReadinessChecklist onProgressChange={refreshProgress} />

          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-3">
              {PMP_NEXUS_COURSE.map((lesson) => {
                const status = lessonProgress[lesson.id] ?? "not_started";
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLessonId(lesson.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedLessonId === lesson.id
                        ? "border-fuchsia-300 bg-fuchsia-300/10"
                        : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-fuchsia-200/90">
                        {lesson.week}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <LessonStatusBadge status={status} />
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-cyan-200">
                          ~{lesson.estimateHours}h
                        </span>
                      </div>
                    </div>
                    <h3 className="mt-2 font-semibold text-white">{lesson.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">{lesson.domain}</p>
                  </button>
                );
              })}
            </div>

            <article className="rounded-2xl border border-white/10 bg-slate-900 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-200">
                    {selectedLesson.week} / {selectedLesson.domain} · ~{selectedLesson.estimateHours} jam
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-white">{selectedLesson.title}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{selectedLesson.outcome}</p>
                </div>
                <LessonCompletionButtons
                  status={lessonProgress[selectedLesson.id] ?? "not_started"}
                  onChange={(next) => updateLessonStatus(selectedLesson.id, next)}
                />
              </div>
              <div className="mt-6 grid gap-5">
                {selectedLesson.fastTrack && (
                  <ContentBlock title="Fast-track Anchor" items={[selectedLesson.fastTrack]} tone="accent" />
                )}
                <ContentBlock title="Plain-English Concept" items={[selectedLesson.plainEnglish]} />
                <ContentBlock title="Andromeda's Coach Notes" items={selectedLesson.nexusCoachNotes} />
                <ContentBlock title="Practice Drills" items={selectedLesson.drills} />
                <ContentBlock title="Exam Traps" items={selectedLesson.examTraps} tone="warning" />
              </div>
            </article>
          </div>
        </section>
      )}

      {workspaceMode === "simulator" && currentQuestion && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setWorkspaceMode("course")}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10"
            >
              ← Back to Course
            </button>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-200/80">
              Attempt #{attemptNumber} · Bank rotation 1:5
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                    Question {questionIndex + 1} of {simulationQuestions.length}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {currentQuestion.domain} / {currentQuestion.approach} / {currentQuestion.difficulty}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {examLengthOptions.map((length) => (
                    <button
                      key={length}
                      onClick={() => resetSimulation(length, true)}
                      className={`rounded-md px-3 py-2 text-xs font-bold ${
                        examLength === length ? "bg-cyan-300 text-slate-950" : "bg-white/5 text-slate-300"
                      }`}
                    >
                      {length}Q
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-black/25 p-5 text-base leading-8 text-slate-100">
                {currentQuestion.scenario}
              </div>

              <div className="mt-5 grid gap-3">
                {(["A", "B", "C", "D"] as const).map((choice) => {
                  const isSelected = answers[questionIndex] === choice;
                  // After submit: only reveal answers when the user actually answered.
                  const showAnswerHints = submitted && isAnswered;
                  const isCorrect = showAnswerHints && currentQuestion.correctAnswer === choice;
                  const isWrong = showAnswerHints && isSelected && !isCorrect;
                  return (
                    <button
                      key={choice}
                      onClick={() => answerCurrent(choice)}
                      className={`rounded-xl border p-4 text-left text-sm leading-6 transition ${
                        isCorrect
                          ? "border-emerald-300 bg-emerald-300/15 text-emerald-50"
                          : isWrong
                            ? "border-rose-300 bg-rose-300/15 text-rose-50"
                            : isSelected
                              ? "border-cyan-300 bg-cyan-300/10 text-white"
                              : "border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.07]"
                      }`}
                    >
                      <span className="mr-3 font-bold text-cyan-200">{choice}</span>
                      {currentQuestion.options[choice]}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div
                  className={`mt-5 rounded-xl border p-4 text-sm leading-6 ${
                    !isAnswered
                      ? "border-slate-500/30 bg-slate-500/10 text-slate-300"
                      : currentIsCorrect
                        ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-50"
                        : "border-rose-300/30 bg-rose-300/10 text-rose-50"
                  }`}
                >
                  {!isAnswered ? (
                    <>
                      Soal ini tidak dijawab — jawaban benar disembunyikan supaya kamu bisa retry
                      jujur di attempt berikutnya. Reset untuk mulai attempt baru dari rotasi bank.
                    </>
                  ) : (
                    currentQuestion.explanation
                  )}
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() =>
                    setFlagged((current) => ({ ...current, [questionIndex]: !current[questionIndex] }))
                  }
                  className="rounded-md border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-bold text-amber-100"
                >
                  {flagged[questionIndex] ? "Unflag" : "Flag"}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setQuestionIndex((index) => Math.max(0, index - 1))}
                    className="rounded-md border border-white/10 px-4 py-2 text-sm font-bold text-slate-200"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setQuestionIndex((index) =>
                        Math.min(simulationQuestions.length - 1, index + 1)
                      )
                    }
                    className="rounded-md bg-white px-4 py-2 text-sm font-bold text-slate-950"
                  >
                    Next
                  </button>
                  {!submitted && (
                    <button
                      onClick={() => setSubmitted(true)}
                      className="rounded-md bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950"
                    >
                      Submit
                    </button>
                  )}
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Exam console</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Metric label="Timer" value={formatTimer(elapsedSeconds)} />
                  <Metric label="Answered" value={`${answeredCount}/${simulationQuestions.length}`} />
                  <Metric label="Flagged" value={flaggedCount} />
                  <Metric
                    label="Score"
                    value={submitted ? `${scoreOnAnswered}% (${overallScore}% all)` : "--"}
                  />
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setElapsedSeconds((current) => current + 60)}
                    className="flex-1 rounded-md border border-white/10 px-3 py-2 text-xs font-bold text-slate-200"
                  >
                    +1 min
                  </button>
                  <button
                    onClick={() => resetSimulation(examLength, true)}
                    className="flex-1 rounded-md border border-white/10 px-3 py-2 text-xs font-bold text-slate-200"
                  >
                    Next attempt
                  </button>
                </div>
                {submitted && (
                  <button
                    onClick={analyzeFromSimulator}
                    disabled={diagnosticLoading}
                    className="mt-3 w-full rounded-md bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 px-3 py-2 text-xs font-bold text-slate-950 disabled:opacity-50"
                  >
                    {diagnosticLoading ? "Analyzing..." : "Generate Remediation Report"}
                  </button>
                )}
                {diagnosticError && (
                  <p className="mt-2 text-xs font-semibold text-rose-300">{diagnosticError}</p>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Navigator</p>
                <div className="mt-4 grid max-h-[420px] grid-cols-6 gap-2 overflow-auto pr-1">
                  {simulationQuestions.map((_, index) => {
                    const userAnsweredThis = Boolean(answers[index]);
                    const isCorrectAfterSubmit =
                      submitted &&
                      userAnsweredThis &&
                      answers[index] === simulationQuestions[index].correctAnswer;
                    const isWrongAfterSubmit =
                      submitted &&
                      userAnsweredThis &&
                      answers[index] !== simulationQuestions[index].correctAnswer;
                    return (
                      <button
                        key={index}
                        onClick={() => setQuestionIndex(index)}
                        className={`aspect-square rounded-md text-xs font-bold ${
                          questionIndex === index
                            ? "bg-cyan-300 text-slate-950"
                            : isCorrectAfterSubmit
                              ? "bg-emerald-300/80 text-slate-950"
                              : isWrongAfterSubmit
                                ? "bg-rose-300/70 text-slate-950"
                                : flagged[index]
                                  ? "bg-amber-300 text-slate-950"
                                  : userAnsweredThis
                                    ? "bg-violet-300/60 text-slate-950"
                                    : "bg-white/10 text-slate-300"
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>
        </section>
      )}

      {workspaceMode === "andromeda" && <AndromedaChat />}

      {workspaceMode === "brain-dump" && <PmpBrainDumps />}

      {workspaceMode === "diagnostic" && (
        <section className="space-y-3">
          <button
            onClick={() => setWorkspaceMode("simulator")}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10"
          >
            ← Back to Simulator
          </button>
          <div className="grid gap-6 lg:grid-cols-[0.4fr_1fr]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-200">
                How this works
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Diagnostic dijalankan otomatis dari hasil <strong>Submit</strong> di Simulator —
                tidak perlu paste JSON. Andromeda akan men-cluster wrong-answer kamu, mengidentifikasi
                trap pattern (escalation / firefighter / agile-command / scope-rigidity), dan
                memberi 7-hari remediation plan.
              </p>
              <button
                onClick={analyzeFromSimulator}
                disabled={diagnosticLoading || answeredCount === 0}
                className="mt-4 w-full rounded-lg bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {diagnosticLoading
                  ? "Analyzing..."
                  : answeredCount === 0
                    ? "Jawab simulator dulu"
                    : "Re-analyze hasil simulator"}
              </button>
              {diagnosticError && (
                <p className="mt-3 text-sm font-semibold text-rose-300">{diagnosticError}</p>
              )}
            </div>
            <div className="min-h-[520px] rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-2xl shadow-black/20">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                Diagnostic report
              </p>
              <pre className="mt-5 max-h-[680px] overflow-auto whitespace-pre-wrap rounded-xl bg-black/35 p-5 text-sm leading-6 text-slate-100">
                {diagnosticReport ||
                  "Selesaikan simulator + Submit untuk men-generate remediation report otomatis."}
              </pre>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function ProgressStrip({
  snapshot,
}: {
  snapshot: {
    completedLessons: number;
    totalLessons: number;
    percentComplete: number;
    readinessPercent: number;
    overallPercent: number;
  };
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900 p-4">
      <div className="grid gap-3 md:grid-cols-3">
        <ProgressBar
          label="Lesson progress"
          percent={snapshot.percentComplete}
          detail={`${snapshot.completedLessons}/${snapshot.totalLessons} lesson selesai`}
          tone="fuchsia"
        />
        <ProgressBar
          label="Readiness checklist"
          percent={snapshot.readinessPercent}
          detail="Item siap exam"
          tone="cyan"
        />
        <ProgressBar
          label="Overall readiness"
          percent={snapshot.overallPercent}
          detail="Composite score Andromeda"
          tone="violet"
        />
      </div>
    </section>
  );
}

function ProgressBar({
  label,
  percent,
  detail,
  tone,
}: {
  label: string;
  percent: number;
  detail: string;
  tone: "fuchsia" | "cyan" | "violet";
}) {
  const gradient =
    tone === "fuchsia"
      ? "from-fuchsia-400 to-pink-400"
      : tone === "cyan"
        ? "from-cyan-300 to-sky-300"
        : "from-violet-400 to-fuchsia-400";
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
        <p className="text-lg font-bold text-white">{percent}%</p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full bg-gradient-to-r ${gradient} transition-all`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-slate-400">{detail}</p>
    </div>
  );
}

function LessonStatusBadge({ status }: { status: LessonStatus }) {
  if (status === "completed") {
    return (
      <span className="rounded-full bg-emerald-300/20 px-2 py-0.5 text-[10px] font-bold text-emerald-200">
        ✓ Done
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="rounded-full bg-amber-300/20 px-2 py-0.5 text-[10px] font-bold text-amber-200">
        In progress
      </span>
    );
  }
  return null;
}

function LessonCompletionButtons({
  status,
  onChange,
}: {
  status: LessonStatus;
  onChange: (status: LessonStatus) => void;
}) {
  return (
    <div className="flex flex-col items-end gap-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Tandai</p>
      <div className="flex gap-1.5">
        <button
          onClick={() => onChange("in_progress")}
          className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
            status === "in_progress"
              ? "bg-amber-300 text-slate-950"
              : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
          }`}
        >
          In progress
        </button>
        <button
          onClick={() => onChange("completed")}
          className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
            status === "completed"
              ? "bg-emerald-300 text-slate-950"
              : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
          }`}
        >
          ✓ Selesai
        </button>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function ContentBlock({
  title,
  items,
  tone = "default",
}: {
  title: string;
  items: string[];
  tone?: "default" | "warning" | "accent";
}) {
  const wrapperClass =
    tone === "accent"
      ? "rounded-xl border border-fuchsia-300/30 bg-fuchsia-300/[0.06] p-5"
      : "rounded-xl border border-white/10 bg-white/[0.03] p-5";
  const titleClass =
    tone === "accent" ? "font-semibold text-fuchsia-100" : "font-semibold text-white";
  const itemClass =
    tone === "warning"
      ? "text-amber-100"
      : tone === "accent"
        ? "text-fuchsia-100"
        : "text-slate-300";
  return (
    <section className={wrapperClass}>
      <h3 className={titleClass}>{title}</h3>
      <div className="mt-3 grid gap-2">
        {items.map((item) => (
          <p key={item} className={`text-sm leading-6 ${itemClass}`}>
            {item}
          </p>
        ))}
      </div>
    </section>
  );
}

function FastTrackPanel() {
  const total = totalCourseHours();
  return (
    <section className="grid gap-3 rounded-2xl border border-fuchsia-300/20 bg-gradient-to-r from-fuchsia-950/30 via-violet-950/30 to-cyan-950/20 p-5 md:grid-cols-[1.2fr_1fr]">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-200">
          Andromeda Fast-Track ✦
        </p>
        <h2 className="mt-2 text-lg font-semibold text-white">
          ~{total} jam total focused study, dipecah jadi 6 sprint.
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Pace pilihan: <span className="font-semibold text-fuchsia-200">~14 hari hyper-sprint</span> (sambil cuti / full-time prep) ·{" "}
          <span className="font-semibold text-cyan-200">~30 hari standard</span> (2 jam/hari) ·{" "}
          <span className="font-semibold text-slate-200">~45 hari sustainable</span> (1.5 jam/hari + weekend drill).
        </p>
      </div>
      <div className="rounded-xl border border-amber-300/30 bg-amber-300/[0.05] p-4 text-xs leading-5 text-amber-100">
        <p className="font-semibold uppercase tracking-[0.18em]">Disclaimer estimasi</p>
        <p className="mt-1 text-amber-100/85">
          Angka jam dan timeline di atas adalah <em>indikatif</em>, bukan janji. Hasil aktual sangat
          dipengaruhi pengalaman PM sebelumnya, kecepatan baca, dan disiplin latihan. Andromeda tidak
          menjamin kelulusan PMP — tugas Andromeda adalah membuat belajar lo lebih fokus dan
          scenario-based.
        </p>
      </div>
    </section>
  );
}
