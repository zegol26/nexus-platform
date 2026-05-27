"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";

const IDLE_TIMEOUT_MS = 4 * 60 * 60 * 1000;
const ACTIVITY_EVENTS = [
  "click",
  "keydown",
  "mousemove",
  "pointerdown",
  "scroll",
  "touchstart",
  "visibilitychange",
] as const;

export function IdleLogout() {
  useEffect(() => {
    let timer: number | undefined;

    function resetTimer() {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        signOut({ callbackUrl: "/login?reason=idle" });
      }, IDLE_TIMEOUT_MS);
    }

    resetTimer();
    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, resetTimer, { passive: true });
    });

    return () => {
      if (timer) window.clearTimeout(timer);
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimer);
      });
    };
  }, []);

  return null;
}
