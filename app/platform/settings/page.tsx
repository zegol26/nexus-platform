"use client";

import { useEffect, useState } from "react";

type SettingsPayload = {
  name: string;
  avatarUrl: string;
  learningReminderEnabled: boolean;
  learningReminderTime: string;
  learningGoal: string;
};

type PasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function PlatformSettingsPage() {
  const [form, setForm] = useState<SettingsPayload>({
    name: "",
    avatarUrl: "",
    learningReminderEnabled: false,
    learningReminderTime: "19:00",
    learningGoal: "Study Japanese 20 minutes per day",
  });
  const [passwordForm, setPasswordForm] = useState<PasswordPayload>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [status, setStatus] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

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
    setSaving(true);

    const res = await fetch("/api/platform/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    setStatus(res.ok ? "Settings saved." : "Failed to save settings.");
  };

  const changePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordStatus("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus("New password and confirmation do not match.");
      return;
    }

    setSavingPassword(true);

    const res = await fetch("/api/platform/settings/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }),
    });

    setSavingPassword(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setPasswordStatus(data.error ?? "Failed to update password.");
      return;
    }

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordStatus("Password updated.");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">
          Platform Settings
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">
          Profile and account security
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Update the basic profile shown in Nexus Platform, set your learning reminder preference, and manage your password.
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

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save settings"}
            </button>
            <p className="text-sm text-slate-500">{status}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
            Security
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            Change password
          </h2>
        </div>

        <form onSubmit={changePassword} className="grid gap-5">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Current password
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) =>
                setPasswordForm({ ...passwordForm, currentPassword: event.target.value })
              }
              className="rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-blue-500"
              autoComplete="current-password"
              required
            />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              New password
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm({ ...passwordForm, newPassword: event.target.value })
                }
                className="rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-blue-500"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Confirm new password
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })
                }
                className="rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-blue-500"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={savingPassword}
              className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {savingPassword ? "Updating..." : "Update password"}
            </button>
            <p className="text-sm text-slate-500">{passwordStatus}</p>
          </div>
        </form>
      </section>
    </div>
  );
}
