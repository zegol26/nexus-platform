"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { StoryArcEpisodeChoice, StoryArcEpisodePayload, StoryArcEpisodeProgress } from "@/lib/storyarc/game/episode-progress";
import { getEpisodeVisual } from "@/lib/storyarc/game/visual-registry";

type EpisodeBootstrap = {
  content: { stableId: string; revisionId: string; revision: number; title: string; payload: StoryArcEpisodePayload };
  player: { id: string; name: string };
  state: { stateVersion: number; storyXp: number; storyLevel: number };
  progress: StoryArcEpisodeProgress;
};

type EpisodeSavePayload = {
  error?: string;
  feedback: string;
  state: EpisodeBootstrap["state"];
  progress: StoryArcEpisodeProgress;
};

type VoicePayload = { audioUrl?: string; error?: string };

const characterNames: Record<string, string> = {
  "char-halim": "Pak Halim", "char-hana": "Hana Prameswari", "char-john": "John", "char-maya": "Maya Chen",
  "char-ratna": "Ibu Ratna", "char-ryo": "Ryo Saputra", "char-sari": "Sari", narrator: "Narrator",
};

const locationNames: Record<string, string> = {
  "loc-cafeteria": "Cakrawala Cafeteria", "loc-clubroom": "Bridge Club Room", "loc-corridor": "School Corridor",
  "loc-gate": "School Gate", "loc-hall": "Assembly Hall", "loc-library": "Library", "loc-office": "School Office",
  "loc-workplace": "Workplace", "loc-workshop": "Workshop",
};

const characterPoses: Record<string, Record<string, string[]>> = {
  "char-hana": {
    warm: ["/storyarc/characters/hana-arcade-warm-v3.png"],
    neutral: ["/storyarc/characters/hana-arcade-warm-v3.png"],
    surprised: ["/storyarc/characters/hana-arcade-concerned-v3.png"],
    concerned: ["/storyarc/characters/hana-arcade-concerned-v3.png"],
  },
  "char-ryo": {
    warm: ["/storyarc/characters/ryo-arcade-warm-v3.png"],
    neutral: ["/storyarc/characters/ryo-arcade-warm-v3.png"],
    surprised: ["/storyarc/characters/ryo-arcade-concerned-v3.png"],
    concerned: ["/storyarc/characters/ryo-arcade-concerned-v3.png"],
  },
  "char-john": { neutral: ["/storyarc/characters/john-welcome-v2.webp", "/storyarc/characters/john-coach-v2.webp"] },
  "char-ratna": { neutral: ["/storyarc/characters/ratna-calm-v2.webp", "/storyarc/characters/ratna-instruct-v2.webp"] },
  "char-maya": { neutral: ["/storyarc/characters/maya-wave-v2.webp", "/storyarc/characters/maya-present-v2.webp"] },
  "char-halim": { neutral: ["/storyarc/characters/halim-thoughtful-v2.webp", "/storyarc/characters/halim-instruct-v2.webp"] },
  "char-sari": { neutral: ["/storyarc/characters/sari-nervous-v2.webp", "/storyarc/characters/sari-confident-v2.webp"] },
};

function characterPose(speakerId: string, expression: string | undefined, nodeId: string) {
  const poses = characterPoses[speakerId];
  if (!poses) return undefined;
  const candidates = poses[expression ?? "neutral"] ?? poses.neutral ?? Object.values(poses)[0];
  const hash = [...nodeId].reduce((total, character) => total + character.charCodeAt(0), 0);
  return candidates[hash % candidates.length];
}

function speakerName(id: string, playerName: string) {
  if (id === "player") return playerName;
  return characterNames[id] ?? id.replace(/^char-/, "").replace(/(^|-)([a-z])/g, (_match, separator, letter) => `${separator}${letter.toUpperCase()}`);
}

function voiceProfile(speakerId: string) {
  if (speakerId === "char-hana") return "storyHana";
  if (speakerId === "char-ryo") return "storyRyo";
  if (speakerId === "char-john") return "storyJohn";
  if (speakerId === "char-ratna") return "storyRatna";
  if (speakerId === "char-maya") return "storyMaya";
  if (speakerId === "char-halim") return "storyHalim";
  if (speakerId === "char-sari") return "storySari";
  return "storyNarrator";
}

const vocabularyDefinitions: Record<string, string> = {
  challenging: "difficult, but helping you grow",
  organizing: "arranging ideas in a clear order",
  practice: "repeated activity to improve a skill",
  confident: "sure of your ability or decision",
  improve: "to become better over time",
  opportunity: "a useful chance to do something",
};

function vocabularyForNode(node: StoryArcEpisodePayload["scene"]["dialogueNodes"][number]) {
  const words = [node.text, ...node.choices.map((choice) => choice.text)]
    .join(" ")
    .toLowerCase()
    .match(/[a-z]{6,}/g) ?? [];
  const ignored = new Set(["because", "should", "really", "something", "through", "without", "episode", "conversation"]);
  const unique = [...new Set(words.filter((word) => !ignored.has(word)))];
  const fallback = ["organizing", "challenging", "practice"];
  return [...unique, ...fallback].filter((word, index, all) => all.indexOf(word) === index).slice(0, 3).map((word) => ({
    word,
    definition: vocabularyDefinitions[word] ?? "a useful expression from this conversation",
  }));
}

function choiceMood(classification: StoryArcEpisodeChoice["classification"]) {
  if (classification === "RECALL_EVIDENCE") return "Recall";
  if (classification === "ASSESSED_INTERACTION") return "Focused";
  if (classification === "LEARNING_PRACTICE") return "Determined";
  return "Confident";
}

export function StoryArcEpisodePlayer({
  contentId,
  previousEpisodeId,
  nextEpisodeId,
  episodeNumber,
  totalEpisodes,
}: {
  contentId: string;
  previousEpisodeId?: string;
  nextEpisodeId?: string;
  episodeNumber: number;
  totalEpisodes: number;
}) {
  const [bootstrap, setBootstrap] = useState<EpisodeBootstrap | null>(null);
  const [nodeId, setNodeId] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "saving" | "error">("loading");
  const [message, setMessage] = useState("Loading published episode…");
  const [audioState, setAudioState] = useState<"idle" | "loading" | "playing" | "error">("idle");
  const [autoVoice, setAutoVoice] = useState(false);
  const [voiceReadyKey, setVoiceReadyKey] = useState("");
  const [currentAudioUrl, setCurrentAudioUrl] = useState("");
  const [selectedExpression, setSelectedExpression] = useState("Great!");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voiceCacheRef = useRef(new Map<string, string>());
  const lastAutoSpokenRef = useRef("");

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setStatus("loading");
      try {
        const response = await fetch(`/api/apps/storyarc/episodes/${contentId}`, { cache: "no-store", signal: controller.signal });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Unable to load this episode.");
        if (controller.signal.aborted) return;
        setBootstrap(payload);
        setNodeId(payload.progress.currentNodeId);
        setStatus("ready");
        setMessage(payload.progress.completed ? "Episode complete · inspect hotspots or continue." : "Published episode ready.");
      } catch (error) {
        if (controller.signal.aborted) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Unable to load this episode.");
      }
    }
    void load();
    return () => controller.abort();
  }, [contentId]);

  useEffect(() => () => {
    audioRef.current?.pause();
  }, []);

  const scene = bootstrap?.content.payload.scene;
  const node = useMemo(() => scene?.dialogueNodes.find((candidate) => candidate.id === nodeId), [scene, nodeId]);
  const location = scene ? (locationNames[scene.locationId] ?? scene.locationId) : "StoryArc";

  const prepareVoice = useCallback(async (text: string, speakerId: string, voiceKey: string) => {
    if (speakerId === "player") return;
    const cached = voiceCacheRef.current.get(voiceKey);
    if (cached) {
      setCurrentAudioUrl(cached);
      return cached;
    }
    setAudioState("loading");
    try {
      const response = await fetch("/api/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceProfile: voiceProfile(speakerId), returnUrl: true }),
      });
      const payload = await response.json() as VoicePayload;
      if (!response.ok || !payload.audioUrl) throw new Error(payload.error ?? "Voice is unavailable.");
      voiceCacheRef.current.set(voiceKey, payload.audioUrl);
      setCurrentAudioUrl(payload.audioUrl);
      setVoiceReadyKey(voiceKey);
      setAudioState("idle");
      return payload.audioUrl;
    } catch (error) {
      setAudioState("error");
      setMessage(error instanceof Error ? error.message : "Voice preparation failed.");
      return undefined;
    }
  }, []);

  const playVoice = useCallback((text: string, speakerId: string, voiceKey: string) => {
    if (speakerId === "player") return;
    const audioUrl = voiceCacheRef.current.get(voiceKey);
    if (!audioUrl) {
      void prepareVoice(text, speakerId, voiceKey).then((preparedUrl) => {
        if (preparedUrl) setMessage("Voice ready · tap the speaker once more to play.");
      });
      return;
    }
    lastAutoSpokenRef.current = voiceKey;
    try {
      if (!audioRef.current) throw new Error("Audio player is not ready.");
      audioRef.current.pause();
      audioRef.current.src = audioUrl;
      audioRef.current.currentTime = 0;
      audioRef.current.onended = () => setAudioState("idle");
      audioRef.current.onerror = () => setAudioState("error");
      const playback = audioRef.current.play();
      setAudioState("playing");
      setMessage("Voice playing · cached MP3 ready for replay.");
      void playback.catch((error) => {
        setAudioState("error");
        setMessage(error instanceof Error ? error.message : "Voice playback failed.");
      });
    } catch (error) {
      setAudioState("error");
      setMessage(error instanceof Error ? error.message : "Voice playback failed.");
    }
  }, [prepareVoice]);

  useEffect(() => {
    if (!node || node.speakerId === "player") return;
    const voiceKey = `${contentId}:${node.id}`;
    if (voiceCacheRef.current.has(voiceKey)) setVoiceReadyKey(voiceKey);
    else void prepareVoice(node.text, node.speakerId, voiceKey);
  }, [contentId, node, prepareVoice]);

  useEffect(() => {
    const voiceKey = node ? `${contentId}:${node.id}` : "";
    if (!autoVoice || !node || node.speakerId === "player" || voiceReadyKey !== voiceKey || lastAutoSpokenRef.current === voiceKey) return;
    const timer = window.setTimeout(() => playVoice(node.text, node.speakerId, voiceKey), 180);
    return () => window.clearTimeout(timer);
  }, [autoVoice, contentId, node, playVoice, voiceReadyKey]);

  async function save(command: { type: "choice"; nodeId: string; choiceId: string } | { type: "continue"; nodeId: string; nextNodeId: string } | { type: "hotspot"; hotspotId: string } | { type: "replay" }) {
    if (!bootstrap || status === "saving") return;
    setStatus("saving");
    try {
      const idempotencyKey = crypto.randomUUID();
      let expectedVersion = bootstrap.state.stateVersion;
      let payload: EpisodeSavePayload | null = null;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const response = await fetch(`/api/apps/storyarc/episodes/${contentId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ revisionId: bootstrap.content.revisionId, expectedVersion, idempotencyKey, command }),
        });
        payload = await response.json() as EpisodeSavePayload;
        if (response.status !== 409) {
          if (!response.ok) throw new Error(payload.error ?? "Unable to save the story choice.");
          break;
        }
        const alreadyApplied = command.type === "choice" || command.type === "continue"
          ? payload.progress?.currentNodeId !== command.nodeId
          : command.type === "hotspot"
            ? payload.progress?.inspectedHotspotIds?.includes(command.hotspotId)
            : payload.progress?.currentNodeId === scene?.entryNodeId && payload.progress?.completed === false;
        if (alreadyApplied) {
          payload.feedback = "Progress synchronized.";
          break;
        }
        expectedVersion = payload.state?.stateVersion;
        if (!Number.isInteger(expectedVersion) || attempt === 1) throw new Error(payload.error ?? "Unable to synchronize story progress.");
      }
      if (!payload) throw new Error("Unable to save the story choice.");
      setBootstrap((current) => current ? { ...current, state: payload.state, progress: payload.progress } : current);
      if (command.type === "choice" || command.type === "continue" || command.type === "replay") setNodeId(payload.progress.currentNodeId);
      setStatus("ready");
      setMessage(`${payload.feedback} · XP ${payload.state.storyXp}`);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to save the story choice.");
    }
  }

  function choose(choice: StoryArcEpisodeChoice) {
    if (node) void save({ type: "choice", nodeId: node.id, choiceId: choice.id });
  }

  function continueTo(nextNodeId: string) {
    const destination = scene?.dialogueNodes.find((candidate) => candidate.id === nextNodeId);
    if (!destination) {
      setStatus("error");
      setMessage("The next dialogue node is missing from this published revision.");
      return;
    }
    if (destination.terminal && node) void save({ type: "continue", nodeId: node.id, nextNodeId: destination.id });
    else {
      setNodeId(destination.id);
      setMessage("Dialogue continued.");
    }
  }

  if (!bootstrap || !scene || !node) {
    return <div className="storyarc-game-frame grid place-items-center text-sm text-cyan-100">{message}</div>;
  }

  const inspected = new Set(bootstrap.progress.inspectedHotspotIds);
  const sprite = characterPose(node.speakerId, node.expressionState, node.id);
  const visual = getEpisodeVisual(bootstrap.content.stableId, scene.locationId);
  const vocabulary = vocabularyForNode(node);
  const activeIsHana = node.speakerId === "char-hana";
  const activeSprite = sprite ?? "/storyarc/characters/ryo-arcade-warm-v3.png";
  const activeCharacterId = characterPoses[node.speakerId] ? node.speakerId : "char-ryo";
  const activeSide = activeIsHana ? "right" : "left";
  const companionCharacterId = activeIsHana ? "char-ryo" : "char-hana";
  const companionSprite = activeIsHana ? "/storyarc/characters/ryo-arcade-warm-v3.png" : "/storyarc/characters/hana-arcade-warm-v3.png";
  const companionName = activeIsHana ? "Ryo Saputra" : "Hana Prameswari";
  const companionSide = activeSide === "left" ? "right" : "left";
  const nodeIndex = Math.max(0, scene.dialogueNodes.findIndex((candidate) => candidate.id === node.id));
  const questStep = Math.min(5, nodeIndex + 1);
  const questPercent = Math.round((questStep / 5) * 100);
  const firstStep = Math.max(1, Math.min(episodeNumber - 2, Math.max(1, totalEpisodes - 5)));
  const storySteps = Array.from({ length: Math.min(6, totalEpisodes) }, (_, index) => firstStep + index);

  return (
    <div className="storyarc-reference-console">
      <main className="storyarc-reference-main">
        <header className="storyarc-episode-header">
          <div className="storyarc-episode-title">Episode <strong>{String(episodeNumber).padStart(2, "0")}</strong></div>
          <div className="storyarc-episode-track" aria-label={`Episode ${episodeNumber} of ${totalEpisodes}`}>
            {storySteps.map((step) => <span key={step} data-state={step < episodeNumber ? "done" : step === episodeNumber ? "active" : "locked"}><i>{String(step).padStart(2, "0")}</i>{step < episodeNumber ? <b>✓</b> : step > episodeNumber ? <b>▣</b> : null}</span>)}
          </div>
        </header>

        <section className="storyarc-game-frame storyarc-reference-scene" data-camera={visual.camera} data-light={visual.light} data-foreground={visual.foreground} aria-label={`${bootstrap.content.title} interactive story scene`}>
          <div className="storyarc-scene-bg"><Image src={visual.background} alt={visual.backgroundAlt} fill priority sizes="(max-width: 760px) 100vw, 65vw" className="object-cover" /></div>
          <div className="storyarc-scene-depth storyarc-scene-depth-far" />
          <div className="storyarc-scene-depth storyarc-scene-depth-near" />
          <div className="storyarc-scene-vignette" />
          <div className={`storyarc-cast-member storyarc-cast-${companionSide}`} data-character={companionCharacterId} data-active="false">
            <Image src={companionSprite} alt={`${companionName} listening in the current scene`} fill sizes="(max-width: 760px) 48vw, 28vw" />
          </div>
          <div key={`${node.speakerId}-${node.id}-${activeSprite}`} className={`storyarc-cast-member storyarc-cast-${activeSide}`} data-character={activeCharacterId} data-active="true" data-speaking={audioState === "playing" ? "true" : "false"}>
            <Image src={activeSprite} alt={`${speakerName(node.speakerId, bootstrap.player.name)} speaking in the current scene`} fill sizes="(max-width: 760px) 52vw, 31vw" />
            <span className="storyarc-rig-speech" aria-hidden="true"><i /><i /><i /></span>
          </div>
          <div className="storyarc-scene-location"><strong>{visual.sceneTitle}</strong><span>{location} / {visual.ambience}</span></div>
          <div key={node.id} className="storyarc-reference-dialogue">
            <div className="storyarc-turn-tab">{node.choices.length ? "Your Turn" : speakerName(node.speakerId, bootstrap.player.name)}</div>
            <p><strong>{speakerName(node.speakerId, bootstrap.player.name)}:</strong> {node.text}</p>
            <div className="storyarc-reference-audio">
              <button type="button" disabled={node.speakerId === "player"} onClick={() => playVoice(node.text, node.speakerId, `${contentId}:${node.id}`)} aria-label="Play dialogue audio">{audioState === "loading" ? "…" : audioState === "playing" ? "■" : "🔊"}</button>
              <button type="button" onClick={() => setAutoVoice((current) => !current)} aria-pressed={autoVoice}>AUTO</button>
            </div>
            <audio ref={audioRef} src={currentAudioUrl || undefined} preload="auto" controls={audioState === "error"} className={audioState === "error" && currentAudioUrl ? "storyarc-native-audio" : "sr-only"} onEnded={() => setAudioState("idle")} aria-label="Dialogue audio; transcript shown above" />
          </div>
        </section>

        <section className="storyarc-reference-choices" aria-label="Dialogue choices">
          {node.choices.length ? node.choices.map((choice, index) => (
            <button key={choice.id} type="button" disabled={status === "saving"} onClick={() => choose(choice)} className="storyarc-reference-choice" data-tone={index % 2 === 0 ? "cyan" : "purple"}>
              <span className="storyarc-reference-choice-index">{String.fromCharCode(65 + index)}</span>
              <span className="storyarc-reference-choice-copy"><strong>{choice.text}</strong><small><i>{choiceMood(choice.classification)}</i><b>+{choice.classification === "RECALL_EVIDENCE" ? 15 : choice.classification === "ASSESSED_INTERACTION" ? 12 : 10} XP</b></small></span>
              <span className="storyarc-reference-choice-arrow">›</span>
            </button>
          )) : node.nextNodeId && !node.terminal ? (
            <button type="button" disabled={status === "saving"} onClick={() => continueTo(node.nextNodeId as string)} className="storyarc-reference-choice storyarc-reference-continue" data-tone="cyan"><span className="storyarc-reference-choice-index">›</span><span className="storyarc-reference-choice-copy"><strong>Continue the conversation</strong><small><i>Story</i><b>+2 XP</b></small></span></button>
          ) : null}
        </section>

        {node.terminal ? <section className="storyarc-completion storyarc-reference-completion"><div className="storyarc-completion-inner"><div><strong>EPISODE COMPLETE</strong><p>Explore the scene, replay, or continue.</p></div><div className="storyarc-hotspots">{scene.hotspots.map((hotspot) => <button key={hotspot.id} type="button" disabled={inspected.has(hotspot.id) || status === "saving"} onClick={() => void save({ type: "hotspot", hotspotId: hotspot.id })} className="storyarc-hotspot">{inspected.has(hotspot.id) ? "✓ " : "◇ "}{hotspot.label}</button>)}</div><button type="button" disabled={status === "saving"} onClick={() => void save({ type: "replay" })} className="storyarc-hotspot">↻ Replay</button>{nextEpisodeId ? <Link href={`/apps/storyarc/story?episode=${nextEpisodeId}`} className="storyarc-next-episode">Next episode →</Link> : null}</div></section> : null}
      </main>

      <aside className="storyarc-reference-rail" aria-label="Episode tools">
        {previousEpisodeId ? <Link href={`/apps/storyarc/story?episode=${previousEpisodeId}`} className="storyarc-reference-previous"><span>‹</span> Previous Episode</Link> : <span className="storyarc-reference-previous is-disabled"><span>‹</span> First Episode</span>}
        <section className="storyarc-reference-panel storyarc-quest-panel">
          <h2>⚑ Quest Active</h2><div className="storyarc-quest-body"><div className="storyarc-quest-medal">★</div><div><strong>Confident Communicator</strong><p>Use expressions to respond clearly in conversations.</p></div></div><div className="storyarc-quest-progress"><span><i style={{ width: `${questPercent}%` }} /></span><b>{questStep} / 5</b></div><footer><span>Reward</span><strong>XP {node.choices.length ? 150 : 75}</strong><strong>◆ 50</strong></footer>
        </section>
        <section className="storyarc-reference-panel storyarc-vocabulary-panel">
          <h2>▣ Vocabulary <Link href="/apps/storyarc/learn">View All</Link></h2>{vocabulary.map((entry, index) => <div key={entry.word} className="storyarc-vocabulary-row" data-tone={index % 2 === 0 ? "cyan" : "purple"}><div><strong>{entry.word} <span>🔊</span></strong><p>{entry.definition}</p></div><button type="button" onClick={() => playVoice(entry.word, "narrator", `${contentId}:vocab:${entry.word}`)}>Learn</button></div>)}
        </section>
        <section className="storyarc-reference-panel storyarc-expression-panel">
          <h2>★ Expression Chips <span>Collected 4 / 6</span></h2><div>{[["😀","Great!"],["👍","That's true"],["🙂","I agree"],["🤔","I'm not sure"]].map(([emoji, label]) => <button key={label} type="button" aria-pressed={selectedExpression === label} onClick={() => { setSelectedExpression(label); setMessage(`Expression selected: ${label}`); }}><i>{emoji}</i><span>{label}</span></button>)}<span className="storyarc-expression-locked">?</span><span className="storyarc-expression-locked">?</span></div>
        </section>
        <div role="status" className={`storyarc-reference-status ${status === "error" || audioState === "error" ? "is-error" : ""}`}><strong>{audioState === "playing" ? "VOICE" : status.toUpperCase()}</strong><span>{message}</span></div>
      </aside>
    </div>
  );
}
