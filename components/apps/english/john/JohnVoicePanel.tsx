"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { JOHN_TUTOR_CONFIG } from "@/lib/english/john-tutor-config";

type VoiceState =
  | "idle"
  | "recording"
  | "transcribing"
  | "thinking"
  | "preparing"
  | "error";

type TtsPlaybackState = "idle" | "preparing" | "ready" | "playing" | "blocked" | "error";

const STATE_LABEL: Record<VoiceState, string> = {
  idle: "Talk with John",
  recording: "John is listening...",
  transcribing: "John is reading what you said...",
  thinking: "John is thinking...",
  preparing: "John is preparing his voice...",
  error: "Let's try that again",
};

type Props = {
  onUserTranscript: (text: string) => Promise<string | null>;
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

export function JohnVoicePanel({ onUserTranscript, onStateChange }: Props) {
  const [state, setState] = useState<VoiceState>("idle");
  const [ttsState, setTtsState] = useState<TtsPlaybackState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [hasAudioUrl, setHasAudioUrl] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  const devLog = useCallback((message: string, metadata?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[english-john-tts] ${message}`, metadata ?? "");
    }
  }, []);

  const prepareJohnVoice = useCallback(async (reply: string) => {
    setState("preparing");
    setTtsState("preparing");
    const speakResp = await fetch("/api/voice/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: reply, voiceProfile: "john", returnUrl: true }),
    });
    const payload = await speakResp.json().catch(() => null);
    if (!speakResp.ok) {
      throw new Error(
        (payload?.error as string | undefined) ??
          `Voice failed (HTTP ${speakResp.status}).`
      );
    }

    const cachedUrl = typeof payload?.audioUrl === "string" ? payload.audioUrl : "";
    if (!cachedUrl) throw new Error("Voice URL was not returned.");
    devLog(payload.cacheStatus === "hit" ? "tts cache hit" : "tts cache miss", {
      cacheKey: payload.cacheKey,
      provider: payload.provider,
    });

    const audioResponse = await fetch(cachedUrl);
    if (!audioResponse.ok) {
      throw new Error(`Voice cache failed (HTTP ${audioResponse.status}).`);
    }

    const url = URL.createObjectURL(await audioResponse.blob());
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = url;
    setHasAudioUrl(true);

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener("ended", () => {
        setState("idle");
        setTtsState("ready");
      });
    }
    audioRef.current.src = url;
    setState("idle");
    setTtsState("ready");
  }, [devLog]);

  const playPreparedAudio = useCallback(async () => {
    if (!audioUrlRef.current || !audioRef.current) return;
    setError(null);
    setTtsState("playing");
    try {
      audioRef.current.src = audioUrlRef.current;
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
      devLog("audio play success", { mode: "john" });
    } catch {
      devLog("audio play failure", { mode: "john" });
      setError("Audio blocked by browser. Tap Play again.");
      setTtsState("blocked");
      setState("idle");
    }
  }, [devLog]);

  const failWith = useCallback((message: string) => {
    setError(message);
    setTtsState("error");
    setState("error");
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const handleAudio = useCallback(
    async (blob: Blob) => {
      if (!blob || blob.size === 0) {
        failWith("No audio detected. Move closer to the mic and try again.");
        return;
      }

      setState("transcribing");
      const formData = new FormData();
      formData.append(
        "audio",
        blob,
        `voice.${blob.type.includes("mp4") ? "m4a" : "webm"}`
      );
      formData.set("tutorId", JOHN_TUTOR_CONFIG.tutorId);
      formData.set("courseId", JOHN_TUTOR_CONFIG.courseId);
      formData.set("inputLanguage", JOHN_TUTOR_CONFIG.inputLanguage);
      formData.set("outputLanguage", JOHN_TUTOR_CONFIG.outputLanguage);
      formData.set(
        "clientLocale",
        typeof navigator !== "undefined" ? navigator.language : "unknown"
      );

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
              `Transcribe failed (HTTP ${resp.status}).`
          );
          return;
        }
        transcriptText = String(payload?.text ?? "").trim();
      } catch (cause) {
        failWith(
          cause instanceof Error
            ? `Transcribe failed: ${cause.message}`
            : "Transcribe failed: network problem."
        );
        return;
      }

      if (!transcriptText) {
        failWith("Voice too quiet or unclear. Try again.");
        return;
      }

      setState("thinking");
      let reply: string | null = null;
      try {
        reply = await onUserTranscript(transcriptText);
      } catch (cause) {
        failWith(
          cause instanceof Error ? `John error: ${cause.message}` : "John error."
        );
        return;
      }

      if (!reply) {
        failWith("John didn't reply. Try once more.");
        return;
      }

      try {
        await prepareJohnVoice(reply);
      } catch (cause) {
        failWith(
          cause instanceof Error ? `Voice failed: ${cause.message}` : "Voice failed."
        );
      }
    },
    [failWith, onUserTranscript, prepareJohnVoice]
  );

  const startRecording = useCallback(async () => {
    setError(null);
    setTtsState((current) => (current === "ready" ? current : "idle"));

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      failWith("Your browser doesn't support recording. Use Chrome/Edge/Safari latest.");
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (cause) {
      failWith(
        cause instanceof DOMException && cause.name === "NotAllowedError"
          ? "Mic access denied. Enable microphone permission in your browser settings."
          : "Couldn't access the mic. Check browser permissions."
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
    recorder.onerror = () => failWith("Recorder error. Try again.");

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
    setTtsState(hasAudioUrl ? "ready" : "idle");
    setState("idle");
  }, [hasAudioUrl]);

  const isBusy =
    state === "recording" ||
    state === "transcribing" ||
    state === "thinking" ||
    state === "preparing" ||
    ttsState === "playing";

  return (
    <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-50/40 p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className={`relative flex h-12 w-12 items-center justify-center rounded-full text-xl ${
            state === "recording"
              ? "bg-rose-500 text-white"
              : ttsState === "playing" || ttsState === "ready"
                ? "bg-emerald-500 text-white"
                : "bg-blue-700 text-white"
          }`}
          aria-hidden
        >
          {state === "recording" && (
            <span className="absolute inset-0 -m-1 animate-ping rounded-full bg-rose-500/40" />
          )}
          <span className="relative">🎙</span>
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-950">{STATE_LABEL[state]}</p>
          <p className="text-xs text-slate-500">
            Push-to-talk · 5 conversations/day on the trial plan
          </p>
        </div>
      </div>

      {error && (state === "error" || ttsState === "blocked") && (
        <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
          <button
            type="button"
            onClick={resetError}
            className="ml-2 underline decoration-rose-400 underline-offset-2 hover:text-rose-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {(state === "transcribing" || state === "thinking" || state === "preparing") && (
        <div className="mt-3 flex items-center gap-1 text-xs text-blue-700">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500" />
          <span
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      )}

      {(ttsState === "ready" || ttsState === "blocked" || ttsState === "playing") && hasAudioUrl && (
        <button
          type="button"
          onClick={playPreparedAudio}
          disabled={ttsState === "playing"}
          className="mt-3 w-full rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
        >
          {ttsState === "playing" ? "Playing..." : ttsState === "ready" ? "Ready to Play" : "Play again"}
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
            className="flex-1 rounded-full bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:bg-slate-400"
          >
            🎙 {state === "idle" || state === "error" ? "Talk with John" : "Wait..."}
          </button>
        )}

        <button
          type="button"
          onClick={playPreparedAudio}
          disabled={!hasAudioUrl || isBusy}
          className="rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 disabled:opacity-40"
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
