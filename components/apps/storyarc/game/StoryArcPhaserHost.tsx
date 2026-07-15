"use client";

import { useEffect, useRef, useState } from "react";
import type { StoryArcPlayerAction, StoryArcPlayerSnapshot } from "@/lib/storyarc/game/state";
import type { StoryArcBootstrap, StoryArcCommandResponse } from "@/lib/storyarc/game/bridge";

type MobileDialogueChoice = {
  text: string;
  nextNodeId: string;
  actionType: string;
};

type MobileScenePayload = {
  scene: {
    entryNodeId: string;
    dialogueNodes: Array<{
      id: string;
      text: string;
      choices: MobileDialogueChoice[];
    }>;
  };
};

type MobileControls = {
  phase: "choices" | "hotspots" | "complete";
  prompt: string;
  choices: MobileDialogueChoice[];
};

function dispatchGameKey(code: string, key: string) {
  window.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, code, key }));
}

export function StoryArcPhaserHost() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<StoryArcPlayerSnapshot | null>(null);
  const revisionIdRef = useRef("");
  const scenePayloadRef = useRef<MobileScenePayload | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "offline" | "error">("loading");
  const [message, setMessage] = useState("Preparing published scene and saved progress…");
  const [mobileControls, setMobileControls] = useState<MobileControls | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let destroyGame: (() => void) | undefined;

    async function sendCommand(action: StoryArcPlayerAction): Promise<StoryArcCommandResponse> {
      const current = stateRef.current;
      if (!current) throw new Error("Player state is not ready.");
      const response = await fetch("/api/apps/storyarc/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          expectedVersion: current.stateVersion,
          revisionId: revisionIdRef.current,
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        if (payload?.state) stateRef.current = payload.state;
        throw new Error(payload?.error ?? "Save failed. Your last acknowledged checkpoint is still safe.");
      }
      stateRef.current = payload.state;
      if (action.startsWith("choose-")) {
        const scene = scenePayloadRef.current?.scene;
        const selected = scene?.dialogueNodes.flatMap((node) => node.choices).find((choice) => choice.actionType === action);
        const reaction = scene?.dialogueNodes.find((node) => node.id === selected?.nextNodeId);
        setMobileControls({
          phase: "hotspots",
          prompt: reaction?.text ?? "Your introduction is saved. Inspect the sign or enter the campus.",
          choices: [],
        });
      } else if (action === "enter-school") {
        setMobileControls({ phase: "complete", prompt: "Courtyard checkpoint saved.", choices: [] });
      }
      setStatus("ready");
      setMessage(`Saved · checkpoint ${payload.state.checkpointId} · XP ${payload.state.storyXp}`);
      return payload;
    }

    async function start() {
      try {
        const response = await fetch("/api/apps/storyarc/bootstrap", { signal: controller.signal, cache: "no-store" });
        const bootstrap = await response.json() as StoryArcBootstrap & { error?: string };
        if (!response.ok) throw new Error(bootstrap.error ?? "Unable to load the School Gate scene.");
        if (!containerRef.current || controller.signal.aborted) return;
        stateRef.current = bootstrap.state;
        revisionIdRef.current = bootstrap.content.revisionId;
        const scenePayload = bootstrap.content.payload as MobileScenePayload;
        scenePayloadRef.current = scenePayload;
        const entryNode = scenePayload.scene.dialogueNodes.find((node) => node.id === scenePayload.scene.entryNodeId);
        if (bootstrap.state.currentSceneId === "scene-courtyard-preview") {
          setMobileControls({ phase: "complete", prompt: "Courtyard checkpoint saved.", choices: [] });
        } else if (bootstrap.state.decisionState.introductionChoice) {
          setMobileControls({ phase: "hotspots", prompt: "Your introduction is saved. Inspect the sign or enter the campus.", choices: [] });
        } else {
          setMobileControls({
            phase: "choices",
            prompt: entryNode?.text ?? "Choose how you want to introduce yourself to Hana.",
            choices: entryNode?.choices ?? [],
          });
        }
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const { mountSchoolGateGame } = await import("@/lib/storyarc/game/create-school-gate-game");
        if (!containerRef.current || controller.signal.aborted) return;
        const handle = mountSchoolGateGame({
          parent: containerRef.current,
          bootstrap,
          reducedMotion,
          onCommand: sendCommand,
        });
        destroyGame = handle.destroy;
        setStatus("ready");
        setMessage(bootstrap.state.stateVersion > 1 ? `Resumed · ${bootstrap.state.checkpointId}` : "School Gate ready · progress saves after each acknowledged action");
      } catch (error) {
        if (controller.signal.aborted) return;
        setStatus(navigator.onLine ? "error" : "offline");
        setMessage(error instanceof Error ? error.message : "Unable to load StoryArc.");
      }
    }

    const onOffline = () => { setStatus("offline"); setMessage("Connection interrupted. Your last acknowledged checkpoint is safe; reconnect before choosing."); };
    const onOnline = () => { setStatus("ready"); setMessage("Connection restored. You can continue from the last checkpoint."); };
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    void start();

    return () => {
      controller.abort();
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
      destroyGame?.();
    };
  }, []);

  return (
    <div className="space-y-3">
      <div ref={containerRef} className="aspect-video min-h-0 min-w-0 w-full overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-[#06111c] shadow-2xl shadow-cyan-950/40 [&_canvas]:h-full [&_canvas]:w-full" aria-label="Interactive StoryArc School Gate game" />
      {mobileControls ? (
        <section className="space-y-3 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.04] p-3 sm:hidden" aria-label="Mobile StoryArc controls">
          <p className="text-sm leading-5 text-slate-200">{mobileControls.prompt}</p>
          {mobileControls.phase === "choices" ? (
            <div className="grid gap-2">
              {mobileControls.choices.map((choice, index) => (
                <button
                  key={choice.actionType}
                  type="button"
                  className="min-h-11 rounded-xl border border-cyan-300/20 bg-[#14344a] px-3 py-2 text-left text-sm leading-5 text-white active:bg-cyan-900"
                  onClick={() => dispatchGameKey(`Digit${index + 1}`, String(index + 1))}
                >
                  <span className="mr-2 font-black text-cyan-200">{index + 1}.</span>{choice.text}
                </button>
              ))}
            </div>
          ) : null}
          {mobileControls.phase === "hotspots" ? (
            <div className="grid grid-cols-2 gap-2">
              <button type="button" className="min-h-11 rounded-xl border border-amber-200/20 bg-amber-200/10 px-3 py-2 text-sm font-bold text-amber-50" onClick={() => dispatchGameKey("KeyS", "s")}>Inspect sign</button>
              <button type="button" className="min-h-11 rounded-xl border border-cyan-200/20 bg-cyan-200/10 px-3 py-2 text-sm font-bold text-cyan-50" onClick={() => dispatchGameKey("Enter", "Enter")}>Enter campus</button>
            </div>
          ) : null}
        </section>
      ) : null}
      <div role="status" className={`rounded-2xl border px-4 py-3 text-xs ${status === "error" || status === "offline" ? "border-amber-300/20 bg-amber-300/[0.06] text-amber-100" : "border-cyan-300/10 bg-cyan-300/[0.04] text-slate-300"}`}>
        <span className="font-black uppercase tracking-[0.18em]">{status}</span> · {message}
      </div>
    </div>
  );
}
