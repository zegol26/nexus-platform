"use client";

import { useEffect, useRef, useState } from "react";

type ProfilePayload = {
  name: string;
  email: string;
  image: string | null;
  avatarUrl: string | null;
  learningReminderEnabled: boolean;
  learningReminderTime: string | null;
  learningGoal: string | null;
  role: string;
};

export function ProfileMenu() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [profile, setProfile] = useState<ProfilePayload | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch("/api/platform/profile");
      if (!res.ok) return;
      const data = await res.json();
      setProfile(data.user);
    }

    loadProfile();
  }, []);

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const avatar = profile?.avatarUrl ?? profile?.image;
  const initial = (profile?.name ?? profile?.email ?? "N").charAt(0).toUpperCase();

  const uploadAvatar = (file?: File) => {
    if (!file || !profile) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfile({
        ...profile,
        avatarUrl: String(reader.result),
      });
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!profile) return;

    setSaving(true);
    setStatus("Saving...");

    const res = await fetch("/api/platform/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        learningReminderEnabled: profile.learningReminderEnabled,
        learningReminderTime: profile.learningReminderTime,
        learningGoal: profile.learningGoal,
      }),
    });

    setSaving(false);
    setStatus(res.ok ? "Saved." : "Failed to save.");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 py-1 pl-1 pr-4 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-950/[0.03] transition hover:-translate-y-0.5 hover:bg-white"
        aria-label="Open profile"
      >
        {avatar ? (
          <img
            src={avatar}
            alt={profile?.name ?? "Profile"}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
            {initial}
          </span>
        )}
        <span className="hidden sm:inline">Profile</span>
      </button>

      {open && profile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onMouseDown={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-xl rounded-[2rem] border border-white/70 bg-white p-6 shadow-2xl shadow-slate-950/20"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
              aria-label="Close profile"
            >
              ×
            </button>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
                  User Profile
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  Learning status
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {profile.email} • {profile.role}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              {profile.avatarUrl || profile.image ? (
                <img
                  src={profile.avatarUrl ?? profile.image ?? ""}
                  alt={profile.name ?? "Profile"}
                  className="h-20 w-20 rounded-3xl object-cover ring-1 ring-slate-200"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-950 text-2xl font-semibold text-white">
                  {initial}
                </div>
              )}

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => uploadAvatar(event.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <span aria-hidden>↑</span>
                  Upload avatar
                </button>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Preview tersimpan sebagai avatar profile setelah klik Save.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Display name
                <input
                  value={profile.name ?? ""}
                  onChange={(event) =>
                    setProfile({ ...profile, name: event.target.value })
                  }
                  className="rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-blue-500"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Study goal
                <input
                  value={profile.learningGoal ?? ""}
                  onChange={(event) =>
                    setProfile({ ...profile, learningGoal: event.target.value })
                  }
                  className="rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-blue-500"
                  placeholder="Study Japanese 20 minutes per day"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={profile.learningReminderEnabled}
                    onChange={(event) =>
                      setProfile({
                        ...profile,
                        learningReminderEnabled: event.target.checked,
                      })
                    }
                  />
                  Study reminder
                </label>

                <input
                  type="time"
                  value={profile.learningReminderTime ?? "19:00"}
                  onChange={(event) =>
                    setProfile({
                      ...profile,
                      learningReminderTime: event.target.value,
                    })
                  }
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-400"
              >
                {saving ? "Saving..." : "Save profile"}
              </button>
              <p className="text-sm text-slate-500">{status}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
