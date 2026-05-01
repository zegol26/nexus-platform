"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  level: string;
  order: number;
  module: string | null;
  lessonType: string | null;
};

export default function LessonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [aiReply, setAiReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    async function loadLesson() {
      const res = await fetch(`/api/apps/nihongo/curriculum/${id}`);
      const data = await res.json();

      if (res.ok) {
        setLesson(data.lesson);
      }
    }

    loadLesson();
  }, [id]);

  const askLessonTutor = async () => {
    if (!lesson) return;

    setLoading(true);

    const res = await fetch("/api/apps/nihongo/tutor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Bro, ajarkan lesson ini sebagai tutor Jepang yang natural untuk pelajar Indonesia. Jangan kaku, jangan seperti template ChatGPT. Jelaskan seperti mentor manusia yang sabar tapi to the point.

Title: ${lesson.title}
Description: ${lesson.description}
Level: ${lesson.level}

Yang gue butuh:
- buka dengan penjelasan singkat yang gampang dicerna
- bedah pola/kosakata penting
- kasih 3 contoh kalimat Jepang + romaji + arti Indonesia
- kasih 1 mini latihan
- tutup dengan satu arahan belajar berikutnya`,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setAiReply(data.reply);
    } else {
      setAiReply(data.error || "Tutor belum tersedia. Lesson tetap bisa direview manual.");
    }

    setLoading(false);
  };

  const markComplete = async () => {
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
  };

  if (!lesson) {
    return (
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Loading lesson...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/apps/nihongo/curriculum"
        className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Back to curriculum
      </Link>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-slate-950 px-3 py-1 text-white">
            Lesson {lesson.order}
          </span>
          <span className="rounded-full bg-cyan-50 px-3 py-1 text-cyan-700">
            {lesson.level}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            {lesson.module ?? "Roadmap"}
          </span>
        </div>

        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950">
          {lesson.title}
        </h1>

        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          {lesson.description}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={askLessonTutor}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={loading}
          >
            {loading ? "Generating lesson..." : "Start AI lesson"}
          </button>

          <button
            onClick={markComplete}
            className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-emerald-50 hover:text-emerald-700"
          >
            {completed ? "Completed" : "Mark complete"}
          </button>
        </div>
      </section>

      {aiReply && (
        <section className="whitespace-pre-wrap rounded-3xl border border-cyan-100 bg-cyan-50/70 p-6 text-sm leading-7 text-slate-800 shadow-sm sm:p-8">
          {aiReply}
        </section>
      )}
    </div>
  );
}
