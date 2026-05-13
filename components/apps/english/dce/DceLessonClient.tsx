"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type {
  DceComprehensionQuestion,
  DceDialogue,
  DceGapFill,
  DceGrammarDrill,
  DceLevel,
  DceListeningItem,
  DceModule,
  DceNextCourseItem,
  DceReadingPassage,
  DceRoleplay,
} from "@/lib/english/dce";
import { buildEnglishAnswerFeedback, type EnglishSkillType } from "@/lib/english/dce/feedback";
import { clientTrack } from "@/lib/analytics/clientTrack";

type Tab =
  | "overview"
  | "reading"
  | "listening"
  | "vocabulary"
  | "grammar"
  | "dialogue"
  | "roleplay";

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: "overview", label: "Overview", emoji: "🗺" },
  { id: "reading", label: "Reading", emoji: "📖" },
  { id: "listening", label: "Listening", emoji: "🎧" },
  { id: "vocabulary", label: "Vocabulary", emoji: "📝" },
  { id: "grammar", label: "Grammar", emoji: "🧠" },
  { id: "dialogue", label: "Dialogue", emoji: "💬" },
  { id: "roleplay", label: "Roleplay with John", emoji: "🎭" },
];

type Props = {
  level: DceLevel;
  module: DceModule;
  nextItem?: DceNextCourseItem;
};

export function DceLessonClient({ level, module, nextItem }: Props) {
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    clientTrack({
      eventType: "PAGE_VIEW",
      pagePath: `/apps/english/dce/${level.level}/${module.slug}`,
      metadata: { level: level.level, moduleSlug: module.slug, tab },
    });
  }, [level.level, module.slug, tab]);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef6ff_48%,#f8fafc_100%)] px-4 py-6 text-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <Link
            href={`/apps/english/dce/${level.level}`}
            className="text-sm font-semibold text-blue-700 hover:underline"
          >
            ← {level.name} ({level.cefrRange})
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {module.topic}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            {module.summary}
          </p>
        </section>

        <nav className="flex flex-wrap gap-2 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
          {TABS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setTab(entry.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === entry.id
                  ? "bg-slate-950 text-white shadow"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className="mr-1" aria-hidden>{entry.emoji}</span>
              {entry.label}
            </button>
          ))}
        </nav>

        {tab === "overview" && <OverviewTab module={module} level={level} />}
        {tab === "reading" && <ReadingTab items={module.reading} />}
        {tab === "listening" && <ListeningTab items={module.listening} />}
        {tab === "vocabulary" && <DrillTab items={module.vocabulary} title="Vocabulary gap-fill" />}
        {tab === "grammar" && <DrillTab items={module.grammar} title="Grammar drill" showStructure />}
        {tab === "dialogue" && <DialogueTab items={module.dialogue} />}
        {tab === "roleplay" && (
          <RoleplayTab items={module.roleplay} level={level} module={module} />
        )}
        <CompletionCard level={level} module={module} nextItem={nextItem} />
      </div>
    </main>
  );
}

function OverviewTab({ module, level }: { module: DceModule; level: DceLevel }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card title="Functional language" items={module.functionalLanguage} />
      <Card title="Vocabulary themes" items={module.vocabularyThemes} />
      <Card title="Grammar in context" items={module.grammarInContext} />
      <div className="lg:col-span-3 rounded-3xl border border-blue-200 bg-blue-50 p-6 text-sm leading-6 text-blue-900">
        <p className="font-semibold">How to study this module</p>
        <ol className="mt-3 list-decimal space-y-1 pl-5">
          <li>Read each passage and answer comprehension questions.</li>
          <li>Listen to the dialogue scripts (TTS available via John).</li>
          <li>Drill the vocabulary and grammar quizzes — aim for 80%+.</li>
          <li>Walk through the model dialogue, then run the AI roleplay with John on the {level.name} level.</li>
        </ol>
      </div>
    </div>
  );
}

function Card({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {title}
      </p>
      <ul className="mt-3 space-y-2 text-sm text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span aria-hidden className="mt-0.5 text-blue-700">▸</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReadingTab({ items }: { items: DceReadingPassage[] }) {
  return (
    <div className="space-y-5">
      {items.map((passage) => (
        <article
          key={passage.id}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Reading · {passage.estReadMinutes} min
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">{passage.title}</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
            {passage.text}
          </p>
          <div className="mt-5 space-y-3">
            {passage.questions.map((question, index) => (
              <ComprehensionQuestion
                key={question.id}
                index={index}
                question={question}
                level={levelLabelFromItemId(passage.id)}
                skillType="reading"
              />
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function ListeningTab({ items }: { items: DceListeningItem[] }) {
  return (
    <div className="space-y-5">
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Listening · {item.durationSec}s · {item.speakers.join(" / ")}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">{item.title}</h2>

          <ListeningPlayer text={item.script} id={item.id} speakers={item.speakers} />

          <details className="mt-3 text-sm text-slate-700">
            <summary className="cursor-pointer font-semibold text-blue-700">
              Show transcript
            </summary>
            <p className="mt-2 whitespace-pre-line leading-7">{item.script}</p>
          </details>

          <div className="mt-5 space-y-3">
            {item.questions.map((question, index) => (
              <ComprehensionQuestion
                key={question.id}
                index={index}
                question={question}
                level={item.level ?? "A1-A2"}
                skillType="listening"
              />
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function ListeningPlayer({ text, id, speakers }: { text: string; id: string; speakers: string[] }) {
  const [loading, setLoading] = useState(false);
  const [playingDialogue, setPlayingDialogue] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dialogueLines = useMemo(
    () =>
      text
        .split(/\r?\n/)
        .map((line) => {
          const match = line.match(/^([^:]+):\s*(.+)$/);
          if (!match) return null;
          return { speaker: match[1].trim(), text: match[2].trim() };
        })
        .filter((line): line is { speaker: string; text: string } => Boolean(line)),
    [text]
  );

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceProfile: "john" }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        setError(payload?.error ?? `Voice failed (HTTP ${res.status}).`);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return url;
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Voice failed.");
    } finally {
      setLoading(false);
    }
  }

  async function speakLine(lineText: string, voiceProfile: "john" | "englishFemale") {
    const res = await fetch("/api/voice/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: lineText, voiceProfile }),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      throw new Error(payload?.error ?? `Voice failed (HTTP ${res.status}).`);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    await new Promise<void>((resolve, reject) => {
      const audio = new Audio(url);
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error("Audio playback failed."));
      void audio.play().catch(reject);
    });
    URL.revokeObjectURL(url);
  }

  async function playDialogueVoices() {
    setPlayingDialogue(true);
    setError(null);
    try {
      for (const line of dialogueLines) {
        await speakLine(line.text, line.speaker === speakers[0] ? "john" : "englishFemale");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Voice failed.");
    } finally {
      setPlayingDialogue(false);
    }
  }

  return (
    <div className="mt-4 rounded-2xl bg-slate-50 p-4">
      {audioUrl ? (
        <audio controls src={audioUrl} className="w-full">
          <track kind="captions" />
        </audio>
      ) : (
        <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={playDialogueVoices}
          disabled={playingDialogue || loading || dialogueLines.length === 0}
          className="rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:bg-slate-400"
          aria-label={`Play dialogue voices for ${id}`}
        >
          {playingDialogue ? "Playing..." : "Play John + partner voices"}
        </button>
        <button
          type="button"
          onClick={generate}
          disabled={loading || playingDialogue}
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-blue-300 disabled:text-slate-400"
          aria-label={`Generate single voice audio for ${id}`}
        >
          {loading ? "Generating..." : "Single John voice"}
        </button>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-rose-700">{error}</p>}
    </div>
  );
}

function ComprehensionQuestion({
  index,
  question,
  level,
  skillType,
}: {
  index: number;
  question: DceComprehensionQuestion;
  level: string;
  skillType: EnglishSkillType;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const correct = picked === question.answerIndex;
  const userAnswer = picked === null ? "" : question.options[picked];
  const correctAnswer = question.options[question.answerIndex] ?? "";
  const feedback =
    picked === null
      ? null
      : buildEnglishAnswerFeedback({
          question: question.question,
          userAnswer,
          correctAnswer,
          explanation: question.rationale,
          level,
          skillType,
        });

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-950">
        {index + 1}. {question.question}
      </p>
      <ul className="mt-3 space-y-2">
        {question.options.map((option, optionIndex) => {
          const isPicked = picked === optionIndex;
          const isAnswer = optionIndex === question.answerIndex;
          const showState = picked !== null;

          let classes =
            "block w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-left text-sm text-slate-700 transition hover:border-blue-300";
          if (showState && isAnswer) {
            classes =
              "block w-full rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-left text-sm text-emerald-900";
          } else if (showState && isPicked) {
            classes =
              "block w-full rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-left text-sm text-rose-900";
          }

          return (
            <li key={optionIndex}>
              <button
                type="button"
                onClick={() => setPicked(optionIndex)}
                className={classes}
              >
                {String.fromCharCode(65 + optionIndex)}. {option}
              </button>
            </li>
          );
        })}
      </ul>
      {picked !== null && (
        <p className={`mt-3 text-xs font-semibold ${correct ? "text-emerald-700" : "text-rose-700"}`}>
          {correct ? "Correct ✓" : "Not quite — try again or read the rationale."}
          {question.rationale ? ` ${question.rationale}` : ""}
        </p>
      )}
      {feedback && <AnswerFeedbackCard feedback={feedback} userAnswer={userAnswer} />}
    </div>
  );
}

function levelLabelFromItemId(id: string) {
  if (id.startsWith("fnd")) return "A1-A2";
  if (id.startsWith("int")) return "B1-B2";
  return "C1";
}

function DrillTab({
  items,
  title,
  showStructure,
}: {
  items: (DceGapFill | DceGrammarDrill)[];
  title: string;
  showStructure?: boolean;
}) {
  const [picked, setPicked] = useState<Record<string, number>>({});

  const score = useMemo(() => {
    let total = 0;
    let correct = 0;
    for (const item of items) {
      if (picked[item.id] !== undefined) {
        total += 1;
        if (picked[item.id] === item.answerIndex) correct += 1;
      }
    }
    return { total, correct };
  }, [picked, items]);
  const answeredAll = items.length > 0 && score.total === items.length;
  const weakItems = items
    .filter((item) => picked[item.id] !== undefined && picked[item.id] !== item.answerIndex)
    .slice(0, 3);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {title}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            {items.length} questions
          </h2>
        </div>
        <p className="text-sm font-semibold text-slate-700">
          Score: {score.correct} / {score.total}
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {items.map((item) => {
          const userPicked = picked[item.id];
          const showState = userPicked !== undefined;
          const isCorrect = userPicked === item.answerIndex;

          return (
            <article
              key={item.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              {showStructure && "targetStructure" in item && (
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700">
                  {item.targetStructure}
                </p>
              )}
              <p className="text-sm font-semibold text-slate-950">{item.prompt}</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {item.options.map((option, optionIndex) => {
                  const isPicked = userPicked === optionIndex;
                  const isAnswer = optionIndex === item.answerIndex;

                  let cls =
                    "rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 transition hover:border-blue-300";
                  if (showState && isAnswer) {
                    cls =
                      "rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-left text-sm text-emerald-900";
                  } else if (showState && isPicked) {
                    cls =
                      "rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-left text-sm text-rose-900";
                  }

                  return (
                    <li key={optionIndex}>
                      <button
                        type="button"
                        onClick={() =>
                          setPicked((current) => ({
                            ...current,
                            [item.id]: optionIndex,
                          }))
                        }
                        className={`${cls} w-full`}
                      >
                        {option}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {showState && (
                <p
                  className={`mt-3 text-xs font-semibold ${
                    isCorrect ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {isCorrect ? "Correct ✓" : "Try again"}
                  {item.rationale ? ` — ${item.rationale}` : ""}
                </p>
              )}
              {showState && (
                <AnswerFeedbackCard
                  userAnswer={item.options[userPicked]}
                  feedback={buildEnglishAnswerFeedback({
                    question: item.prompt,
                    userAnswer: item.options[userPicked],
                    correctAnswer: item.options[item.answerIndex] ?? "",
                    explanation: item.rationale,
                    skillType: showStructure ? "grammar" : "sentence_completion",
                  })}
                />
              )}
            </article>
          );
        })}
      </div>
      {answeredAll && (
        <SectionSummary
          score={`${score.correct} / ${items.length}`}
          strengths={[
            score.correct >= Math.ceil(items.length * 0.7)
              ? "You answered most items correctly."
              : "You completed the full practice set.",
            showStructure
              ? "You are building grammar pattern awareness."
              : "You are noticing useful sentence clues.",
          ]}
          needsPractice={
            weakItems.length
              ? weakItems.map((item) =>
                  "targetStructure" in item ? item.targetStructure : item.prompt
                )
              : ["Keep reviewing the same pattern in short daily sentences."]
          }
        />
      )}
    </div>
  );
}

function DialogueTab({ items }: { items: DceDialogue[] }) {
  return (
    <div className="space-y-5">
      {items.map((dialogue) => (
        <article
          key={dialogue.id}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Model dialogue
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">{dialogue.title}</h2>

          <ol className="mt-4 space-y-2 text-sm leading-7 text-slate-800">
            {dialogue.lines.map((line, index) => (
              <li
                key={index}
                className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                  {line.speaker}:
                </span>{" "}
                {line.text}
              </li>
            ))}
          </ol>

          <div className="mt-5 space-y-3">
            {dialogue.questions.map((question, index) => (
              <ComprehensionQuestion
                key={question.id}
                index={index}
                question={question}
                level="conversation"
                skillType="conversation"
              />
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function AnswerFeedbackCard({
  feedback,
  userAnswer,
}: {
  feedback: ReturnType<typeof buildEnglishAnswerFeedback>;
  userAnswer: string;
}) {
  return (
    <div
      className={`mt-4 rounded-2xl border p-4 text-sm leading-6 ${
        feedback.isCorrect
          ? "border-emerald-200 bg-emerald-50 text-emerald-950"
          : "border-amber-200 bg-amber-50 text-amber-950"
      }`}
    >
      <p className="font-semibold">{feedback.isCorrect ? "Nice work." : "Almost there."}</p>
      {!feedback.isCorrect && <p className="mt-1">Your answer: &ldquo;{userAnswer}&rdquo;</p>}
      <p className="mt-1">Correct answer: &ldquo;{feedback.correctAnswer}&rdquo;</p>
      <p className="mt-3 font-semibold">Explanation</p>
      <p>{feedback.explanation}</p>
      <p className="mt-3 font-semibold">Your learning summary</p>
      <p>{feedback.learnerSummary}</p>
      <p className="mt-3 font-semibold">Study tip</p>
      <p>{feedback.studyTip}</p>
    </div>
  );
}

function SectionSummary({
  score,
  strengths,
  needsPractice,
}: {
  score: string;
  strengths: string[];
  needsPractice: string[];
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        Section Summary
      </p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">Score: {score}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-emerald-800">Strengths</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-800">Needs Practice</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {needsPractice.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-600">
        Recommended Next Step: Review the mini lesson, then continue to the next section.
      </p>
    </section>
  );
}

function CompletionCard({
  level,
  module,
  nextItem,
}: {
  level: DceLevel;
  module: DceModule;
  nextItem?: DceNextCourseItem;
}) {
  return (
    <section className="rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">Great work!</h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">
        You completed this section. Continue to the next step when you are ready.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {nextItem ? (
          <Link
            href={nextItem.href}
            className="rounded-full bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Continue to {nextItem.label}
          </Link>
        ) : (
          <Link
            href="/apps/english/dce"
            className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Back to Course Roadmap
          </Link>
        )}
        <Link
          href={`/apps/english/dce/${level.level}`}
          className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:border-blue-300"
        >
          {module.topic} roadmap
        </Link>
      </div>
      {!nextItem && (
        <p className="mt-3 text-sm font-semibold text-blue-900">
          You have reached the end of the English course roadmap.
        </p>
      )}
    </section>
  );
}

function RoleplayTab({
  items,
  level,
  module,
}: {
  items: DceRoleplay[];
  level: DceLevel;
  module: DceModule;
}) {
  return (
    <div className="space-y-5">
      {items.map((roleplay) => (
        <article
          key={roleplay.id}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            Roleplay · {roleplay.turns} turns
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">{roleplay.scenario}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            <span className="font-semibold">Goal:</span> {roleplay.goal}
          </p>
          <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Persona kicks off with
            </p>
            <p className="mt-2">&ldquo;{roleplay.openingLine}&rdquo;</p>
          </div>
          <Link
            href={`/apps/english/john?level=${level.level}&module=${module.slug}&roleplay=${roleplay.id}`}
            className="mt-4 inline-flex rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-600"
          >
            Start roleplay with John →
          </Link>
        </article>
      ))}
    </div>
  );
}
