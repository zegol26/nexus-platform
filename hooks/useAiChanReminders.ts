"use client";

import { useEffect, useMemo, useState } from "react";
import type { AiChanReminder } from "@/lib/ai-chan/reminder-engine";

type AiChanRemindersResponse = {
  reminders: AiChanReminder[];
};

type UseAiChanRemindersResult = {
  reminders: AiChanReminder[];
  activeReminder: AiChanReminder | null;
  activeIndex: number;
  isLoading: boolean;
  error: string | null;
  hasHighPriorityReminder: boolean;
  nextReminder: () => void;
};

const ROTATION_INTERVAL_MS = 9000;

export function useAiChanReminders(): UseAiChanRemindersResult {
  const [reminders, setReminders] = useState<AiChanReminder[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadReminders() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/platform/ai-chan/reminders", {
          signal: controller.signal,
          cache: "no-store",
        });

        if (response.status === 401) {
          setReminders([]);
          return;
        }

        if (!response.ok) {
          throw new Error("Ai-chan belum bisa memuat pengingat.");
        }

        const payload = (await response.json()) as AiChanRemindersResponse;
        setReminders(payload.reminders);
        setActiveIndex(0);
      } catch (loadError) {
        if (controller.signal.aborted) return;

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Ai-chan belum bisa memuat pengingat."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadReminders();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (reminders.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % reminders.length);
    }, ROTATION_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [reminders.length]);

  const activeReminder = reminders[activeIndex] ?? null;
  const hasHighPriorityReminder = useMemo(
    () => reminders.some((reminder) => reminder.priority === "high"),
    [reminders]
  );

  return {
    reminders,
    activeReminder,
    activeIndex,
    isLoading,
    error,
    hasHighPriorityReminder,
    nextReminder: () => {
      setActiveIndex((currentIndex) =>
        reminders.length === 0 ? 0 : (currentIndex + 1) % reminders.length
      );
    },
  };
}
