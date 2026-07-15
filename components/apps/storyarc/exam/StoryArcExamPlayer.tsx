"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { StoryArcExam } from "@/lib/storyarc/exam/exam-runtime";

export function StoryArcExamPlayer({ exam, assignmentId }: { exam: StoryArcExam; assignmentId?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [checkedSections, setCheckedSections] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [audioState, setAudioState] = useState<"idle" | "loading" | "playing" | "error">("idle");
  const [audioTarget, setAudioTarget] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const section = exam.sections[step];

  useEffect(() => () => audioRef.current?.pause(), []);

  function answerKey(questionId: string) {
    return `${section.id}:${questionId}`;
  }

  function checkSection() {
    const selectable = section.questions.filter((question) => question.options.length > 0);
    const unanswered = selectable.filter((question) => answers[answerKey(question.id)] === undefined).length;
    if (unanswered > 0) {
      setNotice(`Answer ${unanswered} remaining question${unanswered === 1 ? "" : "s"} before checking.`);
      return;
    }
    setCheckedSections((current) => current.includes(section.id) ? current : [...current, section.id]);
    setNotice("Section checked. Review the rationale before continuing.");
  }

  function move(nextStep: number) {
    audioRef.current?.pause();
    setAudioState("idle");
    setAudioTarget(null);
    setNotice("");
    setStep(nextStep);
  }

  async function playAudio(text: string, target: string) {
    if (!text || audioState === "loading") return;
    audioRef.current?.pause();
    setAudioTarget(target);
    setAudioState("loading");
    try {
      const response = await fetch("/api/voice/speak", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, voiceProfile: "storyNarrator", returnUrl: true }) });
      const payload = await response.json() as { audioUrl?: string; error?: string };
      if (!response.ok || !payload.audioUrl) throw new Error(payload.error ?? "Audio unavailable");
      const audio = new Audio(payload.audioUrl);
      audioRef.current = audio;
      audio.onended = () => { setAudioState("idle"); setAudioTarget(null); };
      audio.onerror = () => setAudioState("error");
      await audio.play();
      setAudioState("playing");
    } catch {
      setAudioState("error");
      setNotice("Audio could not be prepared. Please try again or review the transcript after checking your answer.");
    }
  }

  async function finishPractice() {
    const scoredQuestions = exam.sections.flatMap((item) => item.questions.map((question) => ({ sectionId: item.id, question }))).filter(({ question }) => question.options.length > 0 && question.answerIndex !== undefined);
    const checkedCount = scoredQuestions.filter(({ sectionId }) => checkedSections.includes(sectionId)).length;
    if (assignmentId && scoredQuestions.length > 0 && checkedCount !== scoredQuestions.length) {
      setNotice("Check every objective section before submitting your assignment score.");
      return;
    }
    if (!assignmentId || scoredQuestions.length === 0) {
      router.push("/apps/storyarc/exam-lab");
      return;
    }
    const earned = scoredQuestions.filter(({ sectionId, question }) => answers[`${sectionId}:${question.id}`] === question.answerIndex).length;
    setFinishing(true);
    setNotice("Saving your assignment score...");
    try {
      const response = await fetch(`/api/apps/storyarc/assignments/${encodeURIComponent(assignmentId)}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: earned, maxScore: scoredQuestions.length }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Score could not be saved.");
      router.push("/apps/storyarc/classroom?success=Exam%20score%20saved.");
      router.refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Score could not be saved.");
      setFinishing(false);
    }
  }

  if (!section) return <div className="mt-6 rounded-3xl border border-amber-300/20 bg-amber-300/[.06] p-6 text-amber-100">This published exam has no runnable sections.</div>;

  const checked = checkedSections.includes(section.id);
  const selectedQuestions = exam.sections.flatMap((item) => item.questions.map((question) => ({ sectionId: item.id, question }))).filter(({ question }) => question.options.length > 0 && question.answerIndex !== undefined);
  const correct = selectedQuestions.filter(({ sectionId, question }) => checkedSections.includes(sectionId) && answers[`${sectionId}:${question.id}`] === question.answerIndex).length;
  const checkedQuestionCount = selectedQuestions.filter(({ sectionId }) => checkedSections.includes(sectionId)).length;
  const progress = Math.round(((step + 1) / exam.sections.length) * 100);

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black tracking-[.18em] text-fuchsia-300">{exam.grade} · {exam.mode.replaceAll("_", " ")}</p><h1 className="mt-2 max-w-3xl text-3xl font-black text-white">{exam.title}</h1></div><div className="rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3 text-right"><p className="text-[10px] text-slate-500">SESSION SCORE</p><p className="text-xl font-black text-white">{correct}/{checkedQuestionCount}</p></div></div>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">{exam.instruction}</p>
      <div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full border border-white/10 px-3 py-2 text-xs text-slate-300">Section {step + 1}/{exam.sections.length}</span>{exam.durationMinutes ? <span className="rounded-full border border-white/10 px-3 py-2 text-xs text-slate-300">Suggested {exam.durationMinutes} min</span> : null}<span className="rounded-full border border-amber-300/15 bg-amber-300/[.05] px-3 py-2 text-xs text-amber-100">Practice session · not certified evidence</span></div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-gradient-to-r from-fuchsia-300 to-indigo-400" style={{ width: `${progress}%` }} /></div>

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/[.035] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black tracking-[.16em] text-fuchsia-300">{section.skill}</p><h2 className="mt-1 text-xl font-black text-white">{section.title}</h2></div>{section.stimulus && section.skill.includes("LISTENING") ? <button type="button" onClick={() => playAudio(section.stimulus as string, section.id)} className="rounded-full bg-fuchsia-300 px-4 py-2 text-xs font-black text-fuchsia-950">{audioTarget === section.id && audioState === "loading" ? "Preparing…" : audioTarget === section.id && audioState === "playing" ? "Playing…" : "🔊 Play audio"}</button> : null}</div>
        {section.stimulus ? section.skill.includes("LISTENING") ? checked ? <details className="mt-5 rounded-2xl border border-white/10 bg-slate-950/45 p-4"><summary className="cursor-pointer text-sm font-black text-fuchsia-200">Review section transcript</summary><p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-300">{section.stimulus}</p></details> : <div className="mt-5 rounded-2xl border border-fuchsia-300/15 bg-fuchsia-300/[.05] p-4"><p className="text-sm leading-6 text-fuchsia-100">Listen to the recording, then answer the printed questions. The transcript unlocks after you check this section.</p>{audioState === "error" ? <p className="mt-3 text-xs text-amber-300">Audio unavailable. Please try again; the transcript remains available after checking.</p> : null}</div> : <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/45 p-4"><p className="whitespace-pre-line text-sm leading-7 text-slate-200">{section.stimulus}</p></div> : null}
        <div className="mt-6 space-y-5">
          {section.questions.map((question, questionIndex) => {
            const key = answerKey(question.id);
            const selected = answers[key];
            const isConstructed = question.options.length === 0;
            return <article key={key} className="rounded-2xl border border-white/10 bg-black/15 p-4">
              {question.photo ? <div className="relative mx-auto mb-5 aspect-[3/2] w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-[0_18px_55px_rgba(0,0,0,.28)]"><Image src={question.photo.src} alt={question.photo.alt} fill sizes="(max-width: 768px) calc(100vw - 3rem), 672px" className="object-cover" priority={questionIndex === 0} /></div> : null}
              {question.passage ? <p className="mb-4 rounded-xl bg-white/[.04] p-3 text-sm leading-6 text-slate-300">{question.passage}</p> : null}
              <div className="flex flex-wrap items-start justify-between gap-3"><p className="font-bold leading-7 text-white"><span className="mr-2 text-fuchsia-300">{questionIndex + 1}.</span>{question.prompt}</p>{question.audioText && section.skill.includes("LISTENING") ? <button type="button" aria-label={`${question.audioLabel ?? "Play audio"} for question ${questionIndex + 1}`} onClick={() => playAudio(`Question ${questionIndex + 1}. ${question.audioText}`, key)} className="shrink-0 rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-3 py-2 text-xs font-black text-fuchsia-100">{audioTarget === key && audioState === "loading" ? "Preparing…" : audioTarget === key && audioState === "playing" ? "Playing…" : `🔊 ${question.audioLabel ?? "Play audio"}`}</button> : null}</div>
              {isConstructed ? <div><textarea aria-label={`Response for question ${questionIndex + 1}`} value={responses[key] ?? ""} onChange={(event) => setResponses((current) => ({ ...current, [key]: event.target.value }))} className="mt-4 min-h-28 w-full rounded-xl border border-white/10 bg-slate-950/60 p-3 text-sm text-white outline-none focus:border-fuchsia-300/50" placeholder={section.skill === "SPEAKING" ? "Write notes, then answer aloud…" : "Write your response…"} />{question.explanation ? <p className="mt-3 text-xs leading-6 text-slate-400">Review focus: {question.explanation}</p> : null}</div> : <div className="mt-4 grid gap-2">{question.options.map((option, optionIndex) => {
                const chosen = selected === optionIndex;
                const correctOption = question.answerIndex === optionIndex;
                const stateClass = checked ? correctOption ? "border-emerald-300/50 bg-emerald-300/10 text-emerald-100" : chosen ? "border-amber-300/50 bg-amber-300/10 text-amber-100" : "border-white/10 text-slate-400" : chosen ? "border-fuchsia-300/60 bg-fuchsia-300/10 text-white" : "border-white/10 bg-white/[.025] text-slate-200 hover:border-fuchsia-300/35";
                const letter = String.fromCharCode(65 + optionIndex);
                const hideSpokenOption = question.answerDisplay === "letters" && !checked;
                return <button key={option} type="button" aria-label={hideSpokenOption ? `Answer ${letter}` : undefined} disabled={checked} onClick={() => setAnswers((current) => ({ ...current, [key]: optionIndex }))} className={`rounded-xl border px-4 py-3 text-left text-sm transition ${stateClass}`}><b className={hideSpokenOption ? "text-fuchsia-300" : "mr-3 text-fuchsia-300"}>{letter}</b>{hideSpokenOption ? null : option}</button>;
              })}</div>}
              {checked && !isConstructed ? <p className="mt-4 rounded-xl bg-white/[.04] p-3 text-sm leading-6 text-slate-300"><b className={selected === question.answerIndex ? "text-emerald-300" : "text-amber-300"}>{selected === question.answerIndex ? "Correct. " : "Review. "}</b>{question.rationales?.[selected] ?? question.explanation ?? "Compare your answer with the supported option."}</p> : null}
              {checked && question.audioText ? <details className="mt-3 rounded-xl border border-white/10 bg-slate-950/40 p-3 text-xs text-slate-400"><summary className="cursor-pointer font-black text-fuchsia-200">Review transcript</summary><p className="mt-2 whitespace-pre-line leading-6">{question.audioText}</p></details> : null}
            </article>;
          })}
        </div>
        {section.questions.some((question) => question.options.length > 0) && !checked ? <button type="button" onClick={checkSection} className="mt-6 rounded-xl bg-fuchsia-300 px-6 py-3 text-sm font-black text-fuchsia-950">Check this section</button> : null}
        {notice ? <p role="status" className="mt-4 text-sm text-fuchsia-100">{notice}</p> : null}
      </section>

      {step === exam.sections.length - 1 && exam.rubric.length > 0 ? <section className="mt-5 rounded-3xl border border-indigo-300/15 bg-indigo-300/[.04] p-5"><h2 className="font-black text-white">Published rubric focus</h2><div className="mt-3 grid gap-3 md:grid-cols-2">{exam.rubric.map((criterion) => <div key={criterion.title} className="rounded-xl border border-white/10 p-3"><p className="font-bold text-indigo-200">{criterion.title}</p><p className="mt-2 text-xs leading-5 text-slate-400">{criterion.description}</p></div>)}</div></section> : null}
      <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-5"><button type="button" disabled={step === 0 || finishing} onClick={() => move(step - 1)} className="rounded-xl border border-white/10 px-5 py-3 text-sm font-black text-white disabled:opacity-30">← Previous</button>{step < exam.sections.length - 1 ? <button type="button" onClick={() => move(step + 1)} className="rounded-xl bg-gradient-to-r from-fuchsia-300 to-indigo-400 px-6 py-3 text-sm font-black text-slate-950">Next section →</button> : <button type="button" disabled={finishing} onClick={finishPractice} className="rounded-xl bg-emerald-300 px-6 py-3 text-sm font-black text-emerald-950 disabled:opacity-60">{finishing ? "Saving score..." : assignmentId ? "Submit assignment ✓" : "Finish practice ✓"}</button>}</div>
    </div>
  );
}
