"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type VoiceState =
  | "idle"
  | "recording"
  | "transcribing"
  | "thinking"
  | "speaking"
  | "error";

const STATE_LABEL: Record<VoiceState, string> = {
  idle: "Talk with Ai-chan",
  recording: "Ai-chan sedang mendengarkan...",
  transcribing: "Ai-chan sedang memahami ucapanmu...",
  thinking: "Ai-chan sedang menjawab...",
  speaking: "Ai-chan sedang berbicara...",
  error: "Coba sekali lagi ya",
};

type Props = {
  /** Called once user audio has been transcribed. Should send the
   * text to the existing tutor endpoint and return the assistant
   * reply text. The panel handles TTS playback after this resolves. */
  onUserTranscript: (text: string) => Promise<string | null>;
  /** Called whenever the panel transitions to a non-error state, so
   * the parent can append messages / clear errors. */
  onStateChange?: (state: VoiceState) => void;
};

function pickRecorderMime(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/mpeg",
    "audio/ogg",
  ];
  for (const mime of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(mime)) return mime;
    } catch {
      // ignore
    }
  }
  return undefined;
}

export function TutorVoicePanel({ onUserTranscript, onStateChange }: Props) {
  const [state, setState] = useState<VoiceState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [hasAudioUrl, setHasAudioUrl] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  // Notify parent on state change.
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  // Cleanup any active stream / object URL on unmount.
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  const playAudioBlob = useCallback(async (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
    }
    audioUrlRef.current = url;
    setHasAudioUrl(true);

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener("ended", () => {
        setState("idle");
      });
    }
    audioRef.current.src = url;
    setAutoplayBlocked(false);

    try {
      await audioRef.current.play();
    } catch {
      // Autoplay blocked by browser.
      setAutoplayBlocked(true);
      setState("idle");
    }
  }, []);

  const handleRepeat = useCallback(async () => {
    if (!audioUrlRef.current || !audioRef.current) return;
    setAutoplayBlocked(false);
    setState("speaking");
    try {
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
    } catch {
      setAutoplayBlocked(true);
      setState("idle");
    }
  }, []);

  const failWith = useCallback((message: string) => {
    setError(message);
    setState("error");
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const handleAudio = useCallback(
    async (blob: Blob) => {
      if (!blob || blob.size === 0) {
        failWith("Tidak ada suara terdeteksi. Coba bicara lebih dekat ke mic.");
        return;
      }

      // 1. Transcribe.
      setState("transcribing");
      const formData = new FormData();
      formData.append("audio", blob, `voice.${blob.type.includes("mp4") ? "m4a" : "webm"}`);

      let transcriptText = "";
      try {
        const resp = await fetch("/api/voice/transcribe", {
          method: "POST",
          body: formData,
        });
        const raw = await resp.text();
        const payload = raw ? safeJson(raw) : null;
        if (!resp.ok) {
          failWith(
            (payload?.error as string | undefined) ??
              `Transcribe gagal (HTTP ${resp.status}).`
          );
          return;
        }
        transcriptText = String(payload?.text ?? "").trim();
      } catch (cause) {
        failWith(
          cause instanceof Error
            ? `Transcribe gagal: ${cause.message}`
            : "Transcribe gagal: jaringan bermasalah."
        );
        return;
      }

      if (!transcriptText) {
        failWith("Suara terlalu pelan atau tidak terdengar. Coba ulang.");
        return;
      }

      // 2. Send to tutor via parent callback.
      setState("thinking");
      let reply: string | null = null;
      try {
        reply = await onUserTranscript(transcriptText);
      } catch (cause) {
        failWith(
          cause instanceof Error
            ? `Tutor gagal: ${cause.message}`
            : "Tutor gagal."
        );
        return;
      }

      if (!reply) {
        failWith("Tutor belum balas. Coba ulang ya.");
        return;
      }

      // 3. Generate Ai-chan voice and play.
      setState("speaking");
      try {
        const speakResp = await fetch("/api/voice/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: reply }),
        });
        if (!speakResp.ok) {
          const payload = await speakResp.json().catch(() => null);
          failWith(
            (payload?.error as string | undefined) ??
              `Voice gagal (HTTP ${speakResp.status}).`
          );
          return;
        }
        const audioBlob = await speakResp.blob();
        await playAudioBlob(audioBlob);
      } catch (cause) {
        failWith(
          cause instanceof Error
            ? `Voice gagal: ${cause.message}`
            : "Voice gagal."
        );
      }
    },
    [failWith, onUserTranscript, playAudioBlob]
  );

  const startRecording = useCallback(async () => {
    setError(null);
    setAutoplayBlocked(false);

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      failWith("Browser kamu belum support recording. Pakai Chrome/Edge/Safari versi terbaru.");
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (cause) {
      failWith(
        cause instanceof DOMException && cause.name === "NotAllowedError"
          ? "Akses mic ditolak. Aktifin permission mic di browser ya."
          : "Tidak bisa akses mic. Cek izin mic di browser."
      );
      return;
    }

    streamRef.current = stream;
    const mimeType = pickRecorderMime();
    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);
    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      const type = chunksRef.current[0]?.type ?? mimeType ?? "audio/webm";
      const blob = new Blob(chunksRef.current, { type });
      chunksRef.current = [];
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      void handleAudio(blob);
    };
    recorder.onerror = () => failWith("Recorder error. Coba ulang.");

    recorderRef.current = recorder;
    recorder.start();
    setState("recording");
  }, [failWith, handleAudio]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
  }, []);

  const resetError = useCallback(() => {
    setError(null);
    setState("idle");
  }, []);

  const isBusy =
    state === "recording" ||
    state === "transcribing" ||
    state === "thinking" ||
    state === "speaking";

  return (
    <div className="rounded-3xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-cyan-50/40 p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className={`relative flex h-12 w-12 items-center justify-center rounded-full text-xl ${
            state === "recording"
              ? "bg-rose-500 text-white"
              : state === "speaking"
                ? "bg-emerald-500 text-white"
                : "bg-cyan-600 text-white"
          }`}
          aria-hidden
        >
          {state === "recording" && (
            <span className="absolute inset-0 -m-1 animate-ping rounded-full bg-rose-500/40" />
          )}
          <span className="relative">🎙</span>
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-950">
            {STATE_LABEL[state]}
          </p>
          <p className="text-xs text-slate-500">
            Push-to-talk · 5 percakapan/hari pada paket trial
          </p>
        </div>
      </div>

      {error && state === "error" && (
        <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
          <button
            type="button"
            onClick={resetError}
            className="ml-2 underline decoration-rose-400 underline-offset-2 hover:text-rose-900"
          >
            Tutup
          </button>
        </div>
      )}

      {(state === "transcribing" || state === "thinking") && (
        <div className="mt-3 flex items-center gap-1 text-xs text-cyan-700">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500" />
          <span
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      )}

      {autoplayBlocked && hasAudioUrl && (
        <button
          type="button"
          onClick={handleRepeat}
          className="mt-3 w-full rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
        >
          Tap to play Ai-chan voice
        </button>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {state === "recording" ? (
          <button
            type="button"
            onClick={stopRecording}
            className="flex-1 rounded-full bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
          >
            ⏹ Stop &amp; Send
          </button>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            disabled={isBusy}
            className="flex-1 rounded-full bg-cyan-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700 disabled:bg-slate-400"
          >
            🎙 {state === "idle" || state === "error" ? "Talk with Ai-chan" : "Tunggu..."}
          </button>
        )}

        <button
          type="button"
          onClick={handleRepeat}
          disabled={!hasAudioUrl || isBusy}
          className="rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 disabled:opacity-40"
        >
          🔁 Repeat
        </button>
      </div>
    </div>
  );
}

function safeJson(raw: string): Record<string, unknown> | null {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}
