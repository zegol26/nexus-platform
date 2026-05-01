"use client";

import { useEffect, useState } from "react";

type SettingsPayload = {
  name: string;
  avatarUrl: string;
  learningReminderEnabled: boolean;
  learningReminderTime: string;
  learningGoal: string;
};

export default function PlatformSettingsPage() {
  const [form, setForm] = useState<SettingsPayload>({
    name: "",
    avatarUrl: "",
    learningReminderEnabled: false,
    learningReminderTime: "19:00",
    learningGoal: "Study Japanese 20 minutes per day",
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch("/api/platform/profile");
      if (!res.ok) return;
      const data = await res.json();
      setForm({
        name: data.user.name ?? "",
        avatarUrl: data.user.avatarUrl ?? data.user.image ?? "",
        learningReminderEnabled: data.user.learningReminderEnabled ?? false,
        learningReminderTime: data.user.learningReminderTime ?? "19:00",
        learningGoal: data.user.learningGoal ?? "Study Japanese 20 minutes per day",
      });
    }

    loadProfile();
  }, []);

  const save = async () => {
    setStatus("Saving...");
    const res = await fetch("/api/platform/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setStatus(res.ok ? "Settings saved." : "Failed to save settings.");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">
          Platform Settings
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">
          Profile and study commitment
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Update the basic profile shown in Nexus Platform and set your learning reminder preference.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid gap-5">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Display name
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-blue-500"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Avatar URL
            <input
              value={form.avatarUrl}
              onChange={(event) => setForm({ ...form, avatarUrl: event.target.value })}
              className="rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-blue-500"
              placeholder="https://..."
            />
          </label>

          <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={form.learningReminderEnabled}
              onChange={(event) =>
                setForm({ ...form, learningReminderEnabled: event.target.checked })
              }
              className="h-4 w-4"
            />
            Enable study reminder
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Reminder time
            <input
              type="time"
              value={form.learningReminderTime}
              onChange={(event) =>
                setForm({ ...form, learningReminderTime: event.target.value })
              }
              className="rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-blue-500"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Learning goal
            <input
              value={form.learningGoal}
              onChange={(event) => setForm({ ...form, learningGoal: event.target.value })}
              className="rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-blue-500"
            />
          </label>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={save}
              className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Save settings
            </button>
            <p className="text-sm text-slate-500">{status}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
