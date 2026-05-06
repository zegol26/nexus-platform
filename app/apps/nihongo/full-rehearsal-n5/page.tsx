"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { UserBadgeHeader } from "@/components/nihongo/UserBadgeHeader";
import { RehearsalFilters } from "@/components/nihongo/rehearsal/RehearsalFilters";
import { RehearsalProgress } from "@/components/nihongo/rehearsal/RehearsalProgress";
import { RehearsalSectionCard } from "@/components/nihongo/rehearsal/RehearsalSectionCard";
import {
  n5RehearsalSections,
  rehearsalCategories,
  type RehearsalSection,
} from "@/app/apps/nihongo/full-rehearsal-n5/n5RehearsalData";

const storageKey = "nexus.nihongo.fullRehearsalN5.reviewed";

type CategoryFilter = RehearsalSection["category"] | "all";

export default function FullRehearsalN5Page() {
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        setStorageReady(true);
        return;
      }

      try {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          setReviewedIds(new Set(parsed.filter((item): item is string => typeof item === "string")));
        }
      } catch {
        window.localStorage.removeItem(storageKey);
      }

      setStorageReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem(storageKey, JSON.stringify(Array.from(reviewedIds)));
  }, [reviewedIds, storageReady]);

  const filteredSections = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return n5RehearsalSections.filter((section) => {
      const categoryMatch = category === "all" || section.category === category;
      if (!categoryMatch) return false;
      if (!keyword) return true;

      const searchable = [
        section.title,
        section.subtitle,
        section.explanation,
        section.category,
        ...section.patterns.flatMap((pattern) => [
          pattern.label,
          pattern.japanese,
          pattern.romaji,
          pattern.meaningId,
        ]),
        ...section.examples.flatMap((example) => [
          example.japanese,
          example.hiragana,
          example.romaji,
          example.meaningId,
        ]),
        ...section.exercises.flatMap((exercise) => [
          exercise.prompt,
          exercise.answer,
          exercise.explanation,
          ...(exercise.choices ?? []),
        ]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(keyword);
    });
  }, [category, search]);

  const toggleReviewed = (id: string) => {
    setReviewedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <UserBadgeHeader />

      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="bg-[linear-gradient(135deg,#0f172a,#155e75,#047857)] p-6 text-white sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100">
                Rehearsal N5
              </p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
                Latihan Rehearsal Lengkap — JLPT N5
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-cyan-50">
                Review tata bahasa, kanji, kosakata, dan latihan sebelum mock test N5.
              </p>
            </div>
            <Link
              href="/apps/nihongo/mock-test/n5"
              className="w-fit rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-50"
            >
              Mulai Mock Test N5
            </Link>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
          <StatCard label="Total Section" value={`${n5RehearsalSections.length}`} />
          <StatCard label="Sudah Direview" value={`${reviewedIds.size}`} />
          <StatCard label="Level Fokus" value="JLPT N5" />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-6 lg:sticky lg:top-6 lg:h-fit">
          <RehearsalProgress
            reviewedCount={reviewedIds.size}
            totalCount={n5RehearsalSections.length}
            onReset={() => setReviewedIds(new Set())}
          />
          <RehearsalFilters
            search={search}
            selectedCategory={category}
            categories={rehearsalCategories}
            onSearchChange={setSearch}
            onCategoryChange={setCategory}
          />
          <section className="rounded-2xl border border-cyan-100 bg-cyan-50 p-5">
            <p className="text-sm font-semibold text-cyan-900">Cara pakai</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Buka section, baca pola, cek contoh kalimat, lalu kerjakan latihan singkat.
              Setelah yakin, tandai sebagai sudah direview.
            </p>
          </section>
        </aside>

        <main className="space-y-4">
          {filteredSections.length ? (
            filteredSections.map((section) => (
              <RehearsalSectionCard
                key={section.id}
                section={section}
                reviewed={reviewedIds.has(section.id)}
                onToggleReviewed={toggleReviewed}
              />
            ))
          ) : (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-950">Materi tidak ditemukan</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Coba ubah kata kunci pencarian atau pilih kategori lain.
              </p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
