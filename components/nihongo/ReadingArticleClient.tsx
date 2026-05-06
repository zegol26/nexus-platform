"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { clientTrack } from "@/lib/analytics/clientTrack";
import type { ReadingRoadmapArticle } from "@/lib/nihongo/reading-roadmap";

type ReadingArticleClientProps = {
  article: ReadingRoadmapArticle;
  previousArticle: Pick<ReadingRoadmapArticle, "slug" | "title"> | null;
  nextArticle: Pick<ReadingRoadmapArticle, "slug" | "title"> | null;
  initiallyCompleted: boolean;
};

export function ReadingArticleClient({
  article,
  previousArticle,
  nextArticle,
  initiallyCompleted,
}: ReadingArticleClientProps) {
  const [showRomaji, setShowRomaji] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [saving, setSaving] = useState(false);

  const paragraphCount = useMemo(
    () => splitIntoParagraphs(article.japanese).length,
    [article.japanese]
  );

  async function markComplete() {
    if (saving || completed) return;

    setSaving(true);
    const response = await fetch("/api/apps/nihongo/reading/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: article.slug }),
    });

    if (response.ok) {
      setCompleted(true);
    }

    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/apps/nihongo/reading"
          className="w-fit rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to roadmap
        </Link>
        <div className="flex flex-wrap gap-2">
          <ToggleButton
            active={showRomaji}
            label="Romaji"
            onClick={() => setShowRomaji((value) => !value)}
          />
          <ToggleButton
            active={showTranslation}
            label="Indonesian"
            onClick={() => setShowTranslation((value) => !value)}
          />
        </div>
      </div>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-[linear-gradient(135deg,#0f172a,#155e75,#0f766e)] p-6 text-white sm:p-8">
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-white/15 px-3 py-1">{article.level}</span>
            <span className="rounded-full bg-white/15 px-3 py-1">
              Article {String(article.order).padStart(2, "0")}
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1">
              {article.estimatedMinutes} min
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1">
              {paragraphCount} reading blocks
            </span>
          </div>
          <h1 className="mt-5 max-w-4xl text-3xl font-semibold leading-tight sm:text-4xl">
            {article.title}
          </h1>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_340px] sm:p-8">
          <article className="space-y-5">
            {splitIntoParagraphs(article.japanese).map((paragraph, index) => (
              <p
                key={`${article.slug}-ja-${index}`}
                className="rounded-2xl bg-slate-50 p-5 text-2xl leading-10 text-slate-950"
              >
                {paragraph}
              </p>
            ))}
          </article>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">Status</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {completed ? "Completed" : "In progress"}
              </p>
              <button
                type="button"
                onClick={markComplete}
                disabled={saving || completed}
                className="mt-5 w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:bg-emerald-600"
              >
                {completed ? "Completed" : saving ? "Saving..." : "Mark Complete"}
              </button>
            </div>

            {showRomaji ? (
              <SupportPanel title="Romaji" body={article.romaji} />
            ) : null}

            {showTranslation ? (
              <SupportPanel title="Terjemahan Indonesia" body={article.indonesia} />
            ) : null}
          </aside>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        {previousArticle ? (
          <ArticleNavLink
            label="Previous"
            href={`/apps/nihongo/reading/${previousArticle.slug}`}
            title={previousArticle.title}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-400">
            First article in the roadmap
          </div>
        )}

        {nextArticle ? (
          <ArticleNavLink
            label="Next"
            href={`/apps/nihongo/reading/${nextArticle.slug}`}
            title={nextArticle.title}
            align="right"
            onClick={() =>
              clientTrack({
                eventType: "READING_STARTED",
                pagePath: `/apps/nihongo/reading/${nextArticle.slug}`,
                lessonId: nextArticle.slug,
              })
            }
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-400 sm:text-right">
            Final article in the roadmap
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-slate-950 text-white"
          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

function SupportPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="max-h-[520px] overflow-y-auto rounded-2xl border border-cyan-100 bg-cyan-50 p-5">
      <p className="text-sm font-semibold text-cyan-800">{title}</p>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-cyan-950">{body}</p>
    </div>
  );
}

function ArticleNavLink({
  label,
  href,
  title,
  align = "left",
  onClick,
}: {
  label: string;
  href: string;
  title: string;
  align?: "left" | "right";
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-200 hover:shadow-md ${
        align === "right" ? "sm:text-right" : ""
      }`}
    >
      <p className="text-sm font-semibold text-cyan-700">{label}</p>
      <p className="mt-1 text-base font-semibold text-slate-950">{title}</p>
    </Link>
  );
}

function splitIntoParagraphs(value: string) {
  const sentences = value
    .split("。")
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .map((sentence) => `${sentence}。`);

  if (sentences.length <= 4) return sentences;

  const paragraphs: string[] = [];
  for (let index = 0; index < sentences.length; index += 4) {
    paragraphs.push(sentences.slice(index, index + 4).join(""));
  }

  return paragraphs;
}
