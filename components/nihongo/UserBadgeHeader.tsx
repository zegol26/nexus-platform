"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type BadgeProfile = {
  currentLevel: string;
  badge: {
    nameIndonesian: string;
    nameJapanese: string;
    motivationalMessage: string;
    imageUrl: string | null;
    iconUrl: string | null;
  } | null;
};

export function UserBadgeHeader() {
  const [profile, setProfile] = useState<BadgeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const response = await fetch("/api/apps/nihongo/pre-assessment/profile");
      if (response.ok) {
        const payload = await response.json();
        setProfile(payload.profile ?? null);
      }
      setLoading(false);
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
        Loading badge...
      </div>
    );
  }

  if (!profile?.badge) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">Belum ada badge</p>
          <p className="mt-1 text-sm text-slate-500">Selesaikan pre-assessment untuk membuka identitas belajar Nihongo.</p>
        </div>
        <Link
          href="/apps/nihongo/pre-assessment"
          className="rounded-full bg-slate-950 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-cyan-700"
        >
          Mulai Pre-Assessment
        </Link>
      </div>
    );
  }

  const imageUrl = imageFailed ? null : profile.badge.imageUrl ?? profile.badge.iconUrl;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={profile.badge.nameIndonesian}
            onError={() => setImageFailed(true)}
            className="h-14 w-14 rounded-2xl object-cover ring-1 ring-cyan-100"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-600 text-lg font-semibold text-white">
            {profile.badge.nameIndonesian.slice(0, 1)}
          </div>
        )}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-950">{profile.badge.nameIndonesian}</p>
            <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">
              {profile.currentLevel}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{profile.badge.nameJapanese}</p>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">{profile.badge.motivationalMessage}</p>
        </div>
      </div>
      <Link href="/apps/nihongo/badges" className="text-sm font-semibold text-cyan-700">
        Lihat badge
      </Link>
    </div>
  );
}
