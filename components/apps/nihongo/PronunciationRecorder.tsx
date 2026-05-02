"use client";

import { useRef, useState } from "react";

type PronunciationRecorderProps = {
  expectedText: string;
  onEvaluation: (payload: {
    audioUrl?: string;
    metadata?: Record<string, unknown>;
    pronunciationScore: number | null;
    fluencyScore: number | null;
    accuracyScore: number | null;
    missingWords: string[];
    misreadWords: string[];
    feedbackIndonesian: string;
    recommendedPractice: string[];
    status?: "evaluated" | "not_tested" | "provider_not_configured" | "pending" | "error";
  }) => void;
};

export function PronunciationRecorder({ expectedText, onEvaluation }: PronunciationRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  async function startRecording() {
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Browser ini belum mendukung rekam langsung. Gunakan upload file audio.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setError("Mikrofon belum bisa diakses. Cek izin browser atau unggah file audio.");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setIsRecording(false);
  }

  function resetRecording() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBlob(null);
    setError(null);
  }

  function onUploadFile(file: File | null) {
    if (!file) return;
    resetRecording();
    setAudioBlob(file);
    setAudioUrl(URL.createObjectURL(file));
  }

  async function submitAudio() {
    if (!audioBlob) {
      setError("Rekam atau unggah audio dulu sebelum lanjut.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    const file =
      audioBlob instanceof File
        ? audioBlob
        : new File([audioBlob], "pronunciation.webm", { type: audioBlob.type || "audio/webm" });

    formData.append("audio", file);
    formData.append("expectedText", expectedText);

    const response = await fetch("/api/apps/nihongo/pre-assessment/pronunciation", {
      method: "POST",
      body: formData,
    });

    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok && response.status !== 202) {
      setError(payload.error ?? "Audio belum bisa dikirim. Coba ulangi sebentar lagi.");
      return;
    }

    if (!payload.evaluation) {
      setError(payload.error ?? "Audio tersimpan, tetapi evaluasi belum tersedia.");
      return;
    }

    onEvaluation({
      ...payload.evaluation,
      audioUrl: payload.audioUrl,
      metadata: payload.metadata,
    });
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap gap-3">
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
          >
            Start Recording
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Stop Recording
          </button>
        )}

        <label className="cursor-pointer rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          Upload Audio
          <input
            type="file"
            accept="audio/webm,audio/mp3,audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/m4a"
            className="sr-only"
            onChange={(event) => onUploadFile(event.target.files?.[0] ?? null)}
          />
        </label>

        {audioBlob ? (
          <button
            type="button"
            onClick={resetRecording}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Re-record
          </button>
        ) : null}
      </div>

      {audioUrl ? (
        <audio controls src={audioUrl} className="w-full">
          <track kind="captions" />
        </audio>
      ) : (
        <p className="text-sm leading-6 text-slate-500">
          Rekam suara langsung atau unggah file webm, mp3, wav, atau m4a.
        </p>
      )}

      {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

      <button
        type="button"
        onClick={submitAudio}
        disabled={isSubmitting || !audioBlob}
        className="w-full rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isSubmitting ? "Mengirim audio..." : "Submit Pronunciation"}
      </button>
    </div>
  );
}
