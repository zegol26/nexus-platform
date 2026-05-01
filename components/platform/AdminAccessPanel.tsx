"use client";

import { useMemo, useState } from "react";

type App = { id: string; name: string; slug: string };
type Lesson = { id: string; title: string; level: string; order: number };
type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  appAccess: { appId: string; status: string; accessExpiresAt: string | null; app: App }[];
  lessonAccess: { lessonId: string; status: string; expiresAt: string | null; lesson: Lesson }[];
};

export function AdminAccessPanel({
  users,
  apps,
  lessons,
}: {
  users: UserRow[];
  apps: App[];
  lessons: Lesson[];
}) {
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id ?? "");
  const [selectedAppId, setSelectedAppId] = useState(apps[0]?.id ?? "");
  const [selectedLessonId, setSelectedLessonId] = useState(lessons[0]?.id ?? "");
  const [durationDays, setDurationDays] = useState(30);
  const [status, setStatus] = useState("");

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId),
    [selectedUserId, users]
  );

  const mutateAccess = async (kind: "app" | "lesson", action: "grant" | "revoke") => {
    setStatus(`${action === "grant" ? "Granting" : "Revoking"} ${kind} access...`);

    const res = await fetch(
      kind === "app"
        ? "/api/platform/admin/app-access"
        : "/api/platform/admin/lesson-access",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          appId: selectedAppId,
          lessonId: selectedLessonId,
          action,
          durationDays,
          reason: "Admin dashboard action",
        }),
      }
    );

    setStatus(res.ok ? "Access updated. Refresh to see latest state." : "Failed to update access.");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-950/[0.04] backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
          Access Control
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
          Grant or revoke access
        </h2>

        <div className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            User
            <select
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
              className="rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-blue-500"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            App
            <select
              value={selectedAppId}
              onChange={(event) => setSelectedAppId(event.target.value)}
              className="rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-blue-500"
            >
              {apps.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Duration days
            <input
              type="number"
              min={1}
              value={durationDays}
              onChange={(event) => setDurationDays(Number(event.target.value))}
              className="rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-blue-500"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => mutateAccess("app", "grant")}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Grant app
            </button>
            <button
              type="button"
              onClick={() => mutateAccess("app", "revoke")}
              className="rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-100"
            >
              Revoke app
            </button>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Lesson
            <select
              value={selectedLessonId}
              onChange={(event) => setSelectedLessonId(event.target.value)}
              className="rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-blue-500"
            >
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {String(lesson.order).padStart(2, "0")} - {lesson.level} - {lesson.title}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => mutateAccess("lesson", "grant")}
              className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-950"
            >
              Grant lesson
            </button>
            <button
              type="button"
              onClick={() => mutateAccess("lesson", "revoke")}
              className="rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-100"
            >
              Revoke lesson
            </button>
          </div>

          <p className="text-sm text-slate-500">{status}</p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-950/[0.04] backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
          Selected user
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
          {selectedUser?.name ?? "No name"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{selectedUser?.email}</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-slate-50 p-5">
            <h3 className="font-semibold text-slate-950">App access</h3>
            <div className="mt-4 space-y-3">
              {selectedUser?.appAccess.length ? (
                selectedUser.appAccess.map((access) => (
                  <div key={access.appId} className="rounded-2xl bg-white p-4 text-sm">
                    <p className="font-semibold text-slate-950">{access.app.name}</p>
                    <p className="mt-1 text-slate-500">
                      {access.status} • expires{" "}
                      {access.accessExpiresAt
                        ? new Date(access.accessExpiresAt).toLocaleDateString()
                        : "never"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No app access.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-slate-50 p-5">
            <h3 className="font-semibold text-slate-950">Lesson access</h3>
            <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
              {selectedUser?.lessonAccess.length ? (
                selectedUser.lessonAccess.map((access) => (
                  <div key={access.lessonId} className="rounded-2xl bg-white p-4 text-sm">
                    <p className="font-semibold text-slate-950">
                      {access.lesson.order}. {access.lesson.title}
                    </p>
                    <p className="mt-1 text-slate-500">
                      {access.status} • {access.lesson.level}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No lesson access.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
