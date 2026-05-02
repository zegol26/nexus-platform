"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Question = {
  id: string;
  order: number;
  prompt: string;
  focusArea: string;
  expectedDuration: string | null;
  audioUrl: string;
  audioReady: boolean;
  audioProvider: string | null;
};

type UserAnswer = {
  id: string;
  questionId: string;
  durationSec: number;
  submittedAt: string;
  status: string;
  review: Review | null;
};

type Review = {
  englishLevel: string;
  pronunciationScore: number | null;
  fluencyScore: number | null;
  grammarScore: number | null;
  vocabularyScore: number | null;
  confidenceScore: number | null;
  overallScore: number | null;
  feedback: string;
  recommendation: string | null;
  visibleToUser: boolean;
};

type ReviewQueueItem = {
  id: string;
  userName: string | null;
  userEmail: string;
  questionPrompt: string;
  questionFocusArea: string;
  durationSec: number;
  submittedAt: string;
  audioUrl: string;
  review: Review | null;
};

const maxRecordingSec = 180;

export function EnglishInterviewClient() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [reviewQueue, setReviewQueue] = useState<ReviewQueueItem[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [recordingSec, setRecordingSec] = useState(0);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  async function loadData() {
    const response = await fetch("/api/apps/english/interview/questions");
    if (!response.ok) {
      setStatus("English Interview belum bisa dimuat.");
      return;
    }

    const payload = await response.json();
    setQuestions(payload.questions ?? []);
    setAnswers(payload.answers ?? []);
    setReviewQueue(payload.reviewQueue ?? []);
    setCanReview(Boolean(payload.canReview));
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const answerByQuestion = useMemo(() => {
    const map = new Map<string, UserAnswer>();
    for (const answer of answers) {
      if (!map.has(answer.questionId)) map.set(answer.questionId, answer);
    }
    return map;
  }, [answers]);

  async function startRecording(questionId: string) {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("Browser belum mendukung rekam audio. Gunakan browser modern.");
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: getSupportedMimeType() });

    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
      setRecordingBlob(blob);
      setRecordingUrl(URL.createObjectURL(blob));
      stream.getTracks().forEach((track) => track.stop());
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setActiveQuestionId(questionId);
    setRecordingSec(0);
    setRecordingBlob(null);
    if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    setRecordingUrl(null);
    setIsRecording(true);
    setStatus("");

    timerRef.current = window.setInterval(() => {
      setRecordingSec((current) => {
        if (current + 1 >= maxRecordingSec) {
          stopRecording();
          return maxRecordingSec;
        }
        return current + 1;
      });
    }, 1000);
  }

  function stopRecording() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  async function submitRecording(questionId: string) {
    if (!recordingBlob) {
      setStatus("Rekam jawaban dulu sebelum submit.");
      return;
    }

    const formData = new FormData();
    formData.append("questionId", questionId);
    formData.append("durationSec", String(Math.max(recordingSec, 1)));
    formData.append("audio", recordingBlob, `english-interview-${questionId}.webm`);

    const response = await fetch("/api/apps/english/interview/answers", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const payload = await response.json();
      setStatus(payload.error ?? "Upload recording gagal.");
      return;
    }

    setStatus("Jawaban tersimpan. Admin atau sensei bisa memberi penilaian manual.");
    setRecordingBlob(null);
    setRecordingUrl(null);
    setActiveQuestionId(null);
    setRecordingSec(0);
    await loadData();
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef6ff_48%,#f8fafc_100%)] px-4 py-6 text-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">Nexus AI English</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Overseas Job Interview Practice
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Dengarkan pertanyaan interview dalam English accent universal, lalu jawab dengan recording maksimal 3 menit.
                Recording disimpan di database dan bisa dinilai manual oleh admin atau sensei.
              </p>
            </div>
            <Link href="/platform/dashboard" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700">
              Back to Platform
            </Link>
          </div>
        </section>

        {status && <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">{status}</div>}

        <section className="grid gap-4">
          {questions.map((question) => {
            const answer = answerByQuestion.get(question.id);
            const isActive = activeQuestionId === question.id;

            return (
              <article key={question.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Question {question.order} / {question.focusArea}
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-slate-950">{question.prompt}</h2>
                    <p className="mt-2 text-sm text-slate-500">Expected answer: {question.expectedDuration ?? "up to 3 minutes"}</p>
                  </div>
                  {answer && (
                    <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
                      {answer.status}
                    </span>
                  )}
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="mb-3 text-sm font-semibold text-slate-700">Question audio</p>
                    <audio controls src={question.audioUrl} className="w-full">
                      <track kind="captions" />
                    </audio>
                    {!question.audioReady && (
                      <p className="mt-2 text-xs text-amber-700">Audio akan dibuat dan dicache saat pertama kali diputar.</p>
                    )}
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="mb-3 text-sm font-semibold text-slate-700">Your answer</p>
                    <div className="flex flex-wrap gap-2">
                      {!isRecording || !isActive ? (
                        <button
                          type="button"
                          onClick={() => startRecording(question.id)}
                          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          Start Recording
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                        >
                          Stop Recording
                        </button>
                      )}
                      {recordingBlob && isActive && (
                        <button
                          type="button"
                          onClick={() => submitRecording(question.id)}
                          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          Submit
                        </button>
                      )}
                    </div>
                    {isActive && <p className="mt-3 text-sm text-slate-500">Recording: {recordingSec}s / {maxRecordingSec}s</p>}
                    {recordingUrl && isActive && (
                      <audio controls src={recordingUrl} className="mt-3 w-full">
                        <track kind="captions" />
                      </audio>
                    )}
                    {answer?.review?.visibleToUser && <ReviewCard review={answer.review} />}
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {canReview && <ReviewQueue items={reviewQueue} onSaved={loadData} />}
      </div>
    </main>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
      <p className="font-semibold">Manual review: {review.englishLevel}</p>
      <p className="mt-2">{review.feedback}</p>
      {review.recommendation && <p className="mt-2">Practice: {review.recommendation}</p>}
      {typeof review.overallScore === "number" && <p className="mt-2 font-semibold">Overall: {review.overallScore}/100</p>}
    </div>
  );
}

function ReviewQueue({ items, onSaved }: { items: ReviewQueueItem[]; onSaved: () => Promise<void> }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [form, setForm] = useState({
    englishLevel: "A2",
    overallScore: "70",
    feedback: "",
    recommendation: "",
  });

  async function saveReview(answerId: string) {
    const response = await fetch("/api/apps/english/interview/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answerId,
        englishLevel: form.englishLevel,
        overallScore: Number(form.overallScore),
        feedback: form.feedback,
        recommendation: form.recommendation,
      }),
    });

    if (response.ok) {
      setActiveId(null);
      setForm({ englishLevel: "A2", overallScore: "70", feedback: "", recommendation: "" });
      await onSaved();
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">Admin / Sensei Review</p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-950">Submitted recordings</h2>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
            <p className="font-semibold text-slate-950">{item.userName ?? item.userEmail}</p>
            <p className="mt-1 text-sm text-slate-600">{item.questionPrompt}</p>
            <audio controls src={item.audioUrl} className="mt-3 w-full">
              <track kind="captions" />
            </audio>
            {item.review ? (
              <ReviewCard review={item.review} />
            ) : activeId === item.id ? (
              <div className="mt-4 grid gap-3">
                <input
                  value={form.englishLevel}
                  onChange={(event) => setForm({ ...form, englishLevel: event.target.value })}
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  placeholder="English level, e.g. A2, B1, B2"
                />
                <input
                  value={form.overallScore}
                  onChange={(event) => setForm({ ...form, overallScore: event.target.value })}
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  type="number"
                  min={0}
                  max={100}
                />
                <textarea
                  value={form.feedback}
                  onChange={(event) => setForm({ ...form, feedback: event.target.value })}
                  className="min-h-28 rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  placeholder="Manual feedback for the learner"
                />
                <textarea
                  value={form.recommendation}
                  onChange={(event) => setForm({ ...form, recommendation: event.target.value })}
                  className="min-h-20 rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  placeholder="Recommended practice"
                />
                <button
                  type="button"
                  onClick={() => saveReview(item.id)}
                  className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                >
                  Save Review
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setActiveId(item.id)}
                className="mt-3 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Add Manual Review
              </button>
            )}
          </div>
        ))}
        {!items.length && <p className="text-sm text-slate-500">No submitted recordings yet.</p>}
      </div>
    </section>
  );
}

function getSupportedMimeType() {
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) return "audio/webm;codecs=opus";
  if (MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
  return "";
}
