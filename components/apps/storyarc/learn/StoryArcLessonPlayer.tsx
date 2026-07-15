"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { parseStoryArcDialogueTranscript, type LessonBlock, type StoryArcLesson } from "@/lib/storyarc/learning/lesson-runtime";

const labels: Record<string, string> = {
  objective: "Mission",
  warmup: "Warm-up",
  "language-focus": "Language focus",
  listening: "Listening lab",
  "guided-practice": "Guided practice",
  production: "Your turn",
  "story-link": "Enter the story",
  "mastery-check": "Mastery check",
};

function ChoiceQuestion({ prompt, options, answerIndex, explanation }: {
  prompt: string; options: string[]; answerIndex: number; explanation: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
      <p className="font-bold leading-6 text-white">{prompt}</p>
      <div className="mt-3 grid gap-2">
        {options.map((option, index) => {
          const checked = selected === index;
          const correct = index === answerIndex;
          return (
            <button key={option} type="button" onClick={() => setSelected(index)} className={`rounded-xl border px-4 py-3 text-left text-sm transition ${checked ? correct ? "border-emerald-300/60 bg-emerald-300/10 text-emerald-100" : "border-amber-300/60 bg-amber-300/10 text-amber-100" : "border-white/10 bg-white/[.03] text-slate-200 hover:border-cyan-300/40"}`}>
              <span className="mr-3 font-black text-cyan-300">{String.fromCharCode(65 + index)}</span>{option}
            </button>
          );
        })}
      </div>
      {selected !== null ? <p className="mt-3 rounded-xl bg-white/[.04] p-3 text-sm leading-6 text-slate-300"><b className={selected === answerIndex ? "text-emerald-300" : "text-amber-300"}>{selected === answerIndex ? "Correct. " : "Try again. "}</b>{explanation}</p> : null}
    </div>
  );
}

function LessonBlockView({ block, lessonId }: { block: LessonBlock; lessonId: string }) {
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [audioState, setAudioState] = useState<"idle" | "loading" | "playing" | "error">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playbackRunRef = useRef(0);
  const dialogueTurns = block.transcript ? parseStoryArcDialogueTranscript(block.transcript) : [];

  useEffect(() => () => {
    playbackRunRef.current += 1;
    audioRef.current?.pause();
  }, []);

  function dialogueVoice(speaker: string, index: number) {
    const normalized = speaker.trim().toUpperCase();
    if (normalized === "NARRATOR") return "storyNarrator";
    if (["A", "M", "MAN", "MALE"].includes(normalized)) return "storyLessonA";
    if (["B", "W", "WOMAN", "FEMALE"].includes(normalized)) return "storyLessonB";
    return index % 2 === 0 ? "storyLessonA" : "storyLessonB";
  }

  async function playTranscript() {
    if (!block.transcript || audioState === "loading" || audioState === "playing") return;
    const runId = playbackRunRef.current + 1;
    playbackRunRef.current = runId;
    try {
      for (const [index, turn] of dialogueTurns.entries()) {
        if (playbackRunRef.current !== runId) return;
        setAudioState("loading");
        const response = await fetch("/api/voice/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: turn.text, voiceProfile: dialogueVoice(turn.speaker, index), returnUrl: true }),
        });
        const payload = await response.json() as { audioUrl?: string; error?: string };
        if (!response.ok || !payload.audioUrl) throw new Error(payload.error ?? "Audio is unavailable.");
        if (playbackRunRef.current !== runId) return;
        const audio = new Audio(payload.audioUrl);
        audio.volume = 1;
        audioRef.current = audio;
        setAudioState("playing");
        await new Promise<void>((resolve, reject) => {
          audio.onended = () => resolve();
          audio.onerror = () => reject(new Error("Audio playback failed."));
          void audio.play().catch(reject);
        });
      }
      if (playbackRunRef.current === runId) setAudioState("idle");
    } catch {
      if (playbackRunRef.current === runId) setAudioState("error");
    }
  }

  return (
    <div className="mt-6 space-y-5">
      {block.title ? <h2 className="text-2xl font-black text-white">{block.title}</h2> : null}
      {block.instruction ? <p className="text-base leading-7 text-slate-200">{block.instruction}</p> : null}
      {block.canDo ? <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[.07] p-4 text-cyan-100"><b>I can:</b> {block.canDo}</div> : null}
      {block.prompts?.map((prompt, index) => <label key={prompt} className="block rounded-2xl border border-white/10 bg-white/[.03] p-4"><span className="block font-bold text-white">{index + 1}. {prompt}</span><textarea className="mt-3 min-h-24 w-full rounded-xl border border-white/10 bg-slate-950/60 p-3 text-sm text-white outline-none focus:border-cyan-300/50" placeholder="Type your answer in English…" /></label>)}
      {block.explanation ? <p className="rounded-2xl border border-indigo-300/15 bg-indigo-300/[.05] p-4 leading-7 text-slate-200">{block.explanation}</p> : null}
      {block.patterns?.map((pattern) => <div key={pattern.text} className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><p className="text-lg font-black text-cyan-200">{pattern.text}</p><p className="mt-2 text-sm leading-6 text-slate-400">{pattern.note}</p></div>)}
      {block.transcript ? <div className="rounded-3xl border border-cyan-300/20 bg-slate-950/45 p-5"><div className="flex items-center justify-between gap-4"><h3 className="font-black text-white">Two-speaker conversation</h3><button type="button" disabled={audioState === "loading" || audioState === "playing"} onClick={playTranscript} className="rounded-full bg-cyan-300 px-4 py-2 text-xs font-black text-slate-950 disabled:cursor-wait disabled:opacity-60">{audioState === "loading" ? "Preparing…" : audioState === "playing" ? "Playing…" : "🔊 Play A/B dialogue"}</button></div><div className="mt-4 space-y-3">{dialogueTurns.map((turn, index) => <div key={`${turn.speaker}-${index}`} className={`max-w-[90%] rounded-2xl border p-3 ${index % 2 === 0 ? "border-blue-300/15 bg-blue-300/[.06]" : "ml-auto border-fuchsia-300/15 bg-fuchsia-300/[.06]"}`}><p className="text-[10px] font-black tracking-[.16em] text-cyan-300">SPEAKER {turn.speaker}</p><p className="mt-1 text-sm leading-6 text-slate-200">{turn.text}</p></div>)}</div>{audioState === "error" ? <p className="mt-3 text-xs text-amber-300">Audio could not play. The full transcript remains available.</p> : null}</div> : null}
      {block.listeningTasks?.map((task, index) => <div key={task.prompt} className="rounded-2xl border border-white/10 bg-white/[.03] p-4"><p className="font-bold text-white">{task.prompt}</p><button type="button" onClick={() => setRevealed((current) => ({ ...current, [index]: !current[index] }))} className="mt-3 text-xs font-black text-cyan-300">{revealed[index] ? "HIDE ANSWER" : "CHECK ANSWER"}</button>{revealed[index] ? <p className="mt-3 text-sm leading-6 text-slate-300"><b className="text-emerald-300">{task.answer}.</b> {task.explanation}</p> : null}</div>)}
      {block.choices?.map((choice, index) => <ChoiceQuestion key={`${lessonId}-${block.type}-${index}-${choice.prompt}`} {...choice} />)}
      {block.transforms?.map((task, index) => <div key={task.prompt} className="rounded-2xl border border-white/10 bg-white/[.03] p-4"><p className="font-bold text-white">{task.prompt}</p><input className="mt-3 w-full rounded-xl border border-white/10 bg-slate-950/60 p-3 text-sm text-white outline-none focus:border-cyan-300/50" placeholder="Rewrite it here…" /><button type="button" onClick={() => setRevealed((current) => ({ ...current, [index]: !current[index] }))} className="mt-3 text-xs font-black text-cyan-300">SHOW MODEL ANSWER</button>{revealed[index] ? <p className="mt-3 text-sm leading-6 text-slate-300"><b className="text-emerald-300">{task.answer}</b><br />{task.explanation}</p> : null}</div>)}
      {block.productionPrompt ? <div className="rounded-3xl border border-fuchsia-300/20 bg-fuchsia-300/[.06] p-5"><h3 className="font-black text-fuchsia-100">Speaking mission</h3><p className="mt-3 leading-7 text-white">{block.productionPrompt}</p><div className="mt-4 flex flex-wrap gap-2">{block.support?.map((item) => <span key={item} className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-200">{item}</span>)}</div><p className="mt-4 text-xs text-slate-400">Practice aloud, then replay the connected episode to use these expressions in context.</p></div> : null}
      {block.storyItemId ? <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/[.06] p-5"><p className="leading-7 text-slate-200">{block.note}</p><Link href={`/apps/storyarc/story?episode=${block.storyItemId}`} className="mt-4 inline-flex rounded-xl bg-emerald-300 px-5 py-3 text-sm font-black text-emerald-950">Play connected episode →</Link></div> : null}
    </div>
  );
}

export function StoryArcLessonPlayer({ lesson }: { lesson: StoryArcLesson }) {
  const [step, setStep] = useState(0);
  const block = lesson.blocks[step];
  const progress = Math.round(((step + 1) / Math.max(1, lesson.blocks.length)) * 100);
  const stepLabel = labels[block?.type] ?? block?.type ?? "Lesson";
  if (!block) return <div className="mt-6 rounded-3xl border border-amber-300/20 bg-amber-300/[.06] p-6 text-amber-100">This published lesson has no learner blocks.</div>;

  return (
    <div className="mt-5">
      <p className="text-xs font-black tracking-[.2em] text-slate-400">{lesson.grade} · {lesson.id.toUpperCase()}</p>
      <h1 className="mt-2 max-w-3xl text-3xl font-black text-white">{lesson.title}</h1>
      <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-gradient-to-r from-cyan-300 to-indigo-400 transition-all" style={{ width: `${progress}%` }} /></div>
      <div className="mt-3 flex items-center justify-between text-xs"><span className="font-black tracking-[.18em] text-cyan-300">{stepLabel.toUpperCase()}</span><span className="text-slate-400">{step + 1} / {lesson.blocks.length}</span></div>
      <LessonBlockView key={`${lesson.id}-${step}`} block={block} lessonId={lesson.id} />
      {step === 0 && lesson.vocabulary.length ? <div className="mt-6"><p className="text-xs font-black tracking-[.18em] text-slate-400">KEY VOCABULARY</p><div className="mt-3 flex flex-wrap gap-2">{lesson.vocabulary.map((word) => <span key={word.term} className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2 text-xs text-slate-200"><b className="text-cyan-200">{word.term}</b> · {word.meaning}</span>)}</div></div> : null}
      <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">
        <button type="button" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))} className="rounded-xl border border-white/10 px-5 py-3 text-sm font-black text-white disabled:opacity-30">← Previous</button>
        {step < lesson.blocks.length - 1 ? <button type="button" onClick={() => setStep((current) => Math.min(lesson.blocks.length - 1, current + 1))} className="rounded-xl bg-gradient-to-r from-cyan-300 to-indigo-400 px-6 py-3 text-sm font-black text-slate-950">Next activity →</button> : <Link href="/apps/storyarc/learn" className="rounded-xl bg-emerald-300 px-6 py-3 text-sm font-black text-emerald-950">Finish lesson ✓</Link>}
      </div>
    </div>
  );
}
