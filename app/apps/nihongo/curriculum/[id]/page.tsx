"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import { UserBadgeHeader } from "@/components/nihongo/UserBadgeHeader";

type LessonContent = {
  lessonTitle: string;
  level: string;
  objective: string;
  explanationIndonesian: string;
  japaneseExamples: Array<{
    japanese: string;
    romaji: string;
    translationIndonesian: string;
  }>;
  grammarNotes: string[];
  commonMistakes: string[];
  miniPractice: string[];
  answerKey: string[];
  summary: string;
  recommendedNextStep: string;
};

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  level: string;
  order: number;
  module: string | null;
  lessonType: string | null;
};

type LessonTemplate = {
  id: string;
  variant: number;
  title: string;
  contentJson: LessonContent;
  contentMd: string | null;
};

type ListeningAsset = {
  scriptJapanese: string;
  scriptRomaji: string | null;
  translationId: string | null;
  audioUrl: string | null;
  audioMimeType: string | null;
  audioProvider: string | null;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function LessonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [content, setContent] = useState<LessonTemplate | null>(null);
  const [listeningAsset, setListeningAsset] = useState<ListeningAsset | null>(null);
  const [aiStep, setAiStep] = useState(1);
  const [loadingLesson, setLoadingLesson] = useState(true);
  const [loadingAi, setLoadingAi] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [tutorSeedPrompt, setTutorSeedPrompt] = useState("");

  useEffect(() => {
    async function loadLesson() {
      setLoadingLesson(true);
      const res = await fetch(`/api/apps/nihongo/curriculum/${id}`);
      const data = await res.json();

      if (res.ok) {
        setLesson(data.lesson);
        setContent(data.defaultTemplate);
        setListeningAsset(data.listeningAsset);
      } else {
        setError(data.error ?? "Lesson belum bisa dimuat.");
      }
      setLoadingLesson(false);
    }

    loadLesson();
  }, [id]);

  const startButtonLabel = useMemo(() => {
    if (aiStep <= 1) return "Lihat Pembahasan Lebih Dalam";
    if (aiStep === 2) return "Lihat Contoh Percakapan";
    return "Generate Pembahasan Baru dengan AI";
  }, [aiStep]);

  async function startAiLesson() {
    if (!lesson || loadingAi) return;
    setLoadingAi(true);
    setError(null);

    const requestedVariant = aiStep + 1;
    const response = await fetch(`/api/apps/nihongo/lessons/${lesson.id}/start-ai-lesson`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestedVariant }),
    });
    const payload = await response.json();

    if (response.ok) {
      const nextContent = payload.template ?? payload.generatedContent;
      if (nextContent?.id && nextContent.id !== content?.id) {
        setContent(nextContent);
      }
      setAiStep((step) => step + 1);
    } else {
      setError(payload.error ?? "AI lesson belum bisa dibuat. Konten saat ini tetap aman.");
    }

    setLoadingAi(false);
  }

  async function markComplete() {
    if (!lesson) return;

    const res = await fetch("/api/apps/nihongo/curriculum/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lessonId: lesson.id,
      }),
    });

    if (res.ok) {
      setCompleted(true);
    }
  }

  if (loadingLesson) {
    return (
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Loading cached lesson...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="mx-auto max-w-4xl rounded-3xl border border-rose-200 bg-rose-50 p-8 text-rose-700 shadow-sm">
        Lesson tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <UserBadgeHeader />

      <Link
        href="/apps/nihongo/curriculum"
        className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Back to curriculum
      </Link>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-slate-950 px-3 py-1 text-white">Lesson {lesson.order}</span>
          <span className="rounded-full bg-cyan-50 px-3 py-1 text-cyan-700">{lesson.level}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{lesson.module ?? "Roadmap"}</span>
        </div>

        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950">{lesson.title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{lesson.description}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={startAiLesson}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={loadingAi}
          >
            {loadingAi ? "Loading pembahasan..." : startButtonLabel}
          </button>

          <button
            type="button"
            onClick={markComplete}
            className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-emerald-50 hover:text-emerald-700"
          >
            {completed ? "Completed" : "Mark complete"}
          </button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <main className="space-y-6">
          {content ? <LessonContentCard content={content.contentJson} variant={content.variant} /> : <MissingTemplateCard />}
          <ListeningPracticeCard
            asset={listeningAsset}
            onAskTutor={() =>
              setTutorSeedPrompt(`Jelaskan listening ini pelan-pelan dan beri contoh tambahan.\n\n${listeningAsset?.scriptJapanese ?? ""}`)
            }
          />
        </main>

        <LessonTutorPanel
          lesson={lesson}
          contentMd={content?.contentMd ?? ""}
          listeningScript={listeningAsset?.scriptJapanese ?? ""}
          seedPrompt={tutorSeedPrompt}
          onSeedPromptUsed={() => setTutorSeedPrompt("")}
        />
      </div>
    </div>
  );
}

function LessonContentCard({ content, variant }: { content: LessonContent; variant: number }) {
  return (
    <section className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Cached lesson variant {variant}</p>
      <h2 className="mt-3 text-3xl font-semibold text-slate-950">{content.lessonTitle}</h2>
      <p className="mt-3 rounded-2xl bg-cyan-50 p-4 text-sm leading-7 text-cyan-900">{content.objective}</p>
      <p className="mt-5 text-sm leading-7 text-slate-700">{content.explanationIndonesian}</p>

      <div className="mt-6 space-y-4">
        {content.japaneseExamples.map((example, index) => (
          <div key={`${example.japanese}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xl leading-8 text-slate-950">{example.japanese}</p>
            <p className="mt-2 text-sm text-slate-500">{example.romaji}</p>
            <p className="mt-1 text-sm text-slate-700">{example.translationIndonesian}</p>
          </div>
        ))}
      </div>

      <ContentList title="Grammar notes" items={content.grammarNotes} />
      <ContentList title="Common mistakes" items={content.commonMistakes} />
      <ContentList title="Mini practice" items={content.miniPractice} />
      <ContentList title="Answer key" items={content.answerKey} tone="emerald" />

      <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
        <p className="text-sm font-semibold text-cyan-200">Summary</p>
        <p className="mt-2 text-sm leading-6 text-slate-200">{content.summary}</p>
        <p className="mt-3 text-sm font-semibold">{content.recommendedNextStep}</p>
      </div>
    </section>
  );
}

function ContentList({ title, items, tone = "slate" }: { title: string; items: string[]; tone?: "slate" | "emerald" }) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <div className="mt-3 space-y-2">
        {items.map((item, index) => (
          <p
            key={`${title}-${index}`}
            className={`rounded-xl px-4 py-3 text-sm leading-6 ${
              tone === "emerald" ? "bg-emerald-50 text-emerald-800" : "bg-slate-50 text-slate-700"
            }`}
          >
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function MissingTemplateCard() {
  return (
    <section className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-slate-600">
      Cached template variant 1 belum tersedia. Jalankan backfill template, lalu refresh lesson ini.
    </section>
  );
}

function ListeningPracticeCard({ asset, onAskTutor }: { asset: ListeningAsset | null; onAskTutor: () => void }) {
  const [showJapanese, setShowJapanese] = useState(true);
  const [showRomaji, setShowRomaji] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  if (!asset) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-950">Listening Practice</h2>
        <p className="mt-3 text-sm text-slate-500">Listening asset belum dibuat untuk lesson ini.</p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Listening Practice</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Dengarkan konteks lesson ini</h2>
        </div>
        <button
          type="button"
          onClick={onAskTutor}
          className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-800"
        >
          Tanya AI Tutor tentang listening ini
        </button>
      </div>

      <div className="mt-5">
        {asset.audioUrl ? (
          <audio controls src={asset.audioUrl} className="w-full">
            <track kind="captions" />
          </audio>
        ) : (
          <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">Audio belum tersedia. Script tetap bisa dipakai untuk reading aloud.</div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <ToggleButton active={showJapanese} onClick={() => setShowJapanese((value) => !value)} label="Japanese" />
        <ToggleButton active={showRomaji} onClick={() => setShowRomaji((value) => !value)} label="Romaji" />
        <ToggleButton active={showTranslation} onClick={() => setShowTranslation((value) => !value)} label="Indonesian" />
      </div>

      <div className="mt-5 space-y-3">
        {showJapanese ? <p className="rounded-2xl bg-slate-50 p-4 text-xl leading-9 text-slate-950">{asset.scriptJapanese}</p> : null}
        {showRomaji && asset.scriptRomaji ? <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">{asset.scriptRomaji}</p> : null}
        {showTranslation && asset.translationId ? <p className="rounded-2xl bg-cyan-50 p-4 text-sm leading-7 text-cyan-900">{asset.translationId}</p> : null}
      </div>
    </section>
  );
}

function ToggleButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

function LessonTutorPanel({
  lesson,
  contentMd,
  listeningScript,
  seedPrompt,
  onSeedPromptUsed,
}: {
  lesson: Lesson;
  contentMd: string;
  listeningScript: string;
  seedPrompt: string;
  onSeedPromptUsed: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Tanya bagian lesson ini yang masih bikin bingung. Aku akan jawab fokus ke konteks materi ini.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (seedMessage?: string) => {
    const message = (seedMessage ?? input).trim();
    if (!message || loading) return;

    setMessages((current) => [...current, { role: "user", content: message }]);
    setInput("");
    setLoading(true);

    const response = await fetch(`/api/apps/nihongo/lessons/${lesson.id}/tutor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        currentTemplateMd: contentMd,
        listeningScript,
      }),
    });
    const payload = await response.json();

    setMessages((current) => [
      ...current,
      {
        role: "assistant",
        content: response.ok ? payload.reply : payload.error ?? "Tutor belum tersedia.",
      },
    ]);
    setLoading(false);
  }, [contentMd, input, lesson.id, listeningScript, loading]);

  useEffect(() => {
    if (!seedPrompt) return;
    const timer = window.setTimeout(() => {
      sendMessage(seedPrompt);
      onSeedPromptUsed();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [onSeedPromptUsed, seedPrompt, sendMessage]);

  return (
    <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">AI Tutor</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">Tutor ini membaca konteks lesson, template aktif, dan listening script.</p>

      <div className="mt-4 max-h-[460px] space-y-3 overflow-y-auto pr-1">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
              message.role === "user" ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-700"
            }`}
          >
            {message.content}
          </div>
        ))}
        {loading ? <div className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm text-cyan-800">Tutor lagi menjawab...</div> : null}
      </div>

      <div className="mt-4 space-y-3">
        <button
          type="button"
          onClick={() => sendMessage("Jelaskan listening ini pelan-pelan dan beri contoh tambahan.")}
          className="w-full rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-left text-sm font-semibold text-cyan-800"
        >
          Tanya AI Tutor tentang listening ini
        </button>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="min-h-24 w-full resize-none rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-cyan-500"
          placeholder="Tanya grammar, contoh, atau latihan..."
        />
        <button
          type="button"
          onClick={() => sendMessage()}
          disabled={loading}
          className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:bg-slate-400"
        >
          Kirim ke Tutor
        </button>
      </div>
    </aside>
  );
}
