"use client";

import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  ClipboardCheck,
  MessageCircle,
  Mic2,
  type LucideIcon,
} from "lucide-react";
import { useLanguage, type UiLanguage } from "@/components/i18n/LanguageProvider";

type AppOverview = {
  name: string;
  label: Record<UiLanguage, string>;
  icon: LucideIcon;
  description: Record<UiLanguage, string>;
  features: Record<UiLanguage, string[]>;
  href: string;
  trialHref?: string;
};

const appOverviews: AppOverview[] = [
  {
    name: "Nexus AI Nihongo",
    label: { id: "Belajar bahasa Jepang", en: "Japanese learning" },
    icon: BrainCircuit,
    description: {
      id: "Mini workspace Jepang untuk melihat rasa dashboard, AI tutor, flashcard, dan jalur latihan JLPT/JFT sebelum berlangganan.",
      en: "A Japanese mini workspace previewing the dashboard, AI tutor, flashcards, and JLPT/JFT practice paths before subscribing.",
    },
    features: {
      id: ["Pre-assessment real", "Flashcard real", "Quiz real", "Progress tidak disimpan"],
      en: ["Real pre-assessment", "Real flashcards", "Real quiz", "Progress is not saved"],
    },
    href: "/overview/nihongo",
    trialHref: "/apps/nihongo/pre-assessment",
  },
  {
    name: "Nexus AI English",
    label: { id: "Interview & conversation", en: "Interview & conversation" },
    icon: Mic2,
    description: {
      id: "Coba tampilan interview practice, John AI coach, CEFR track, dan recording review dalam mode preview terbatas.",
      en: "Preview interview practice, John AI coach, CEFR tracks, and recording review in a limited trial mode.",
    },
    features: {
      id: ["John coach teaser", "Interview prompt", "Recording terkunci", "Preview modul CEFR"],
      en: ["John coach teaser", "Interview prompt", "Recording locked", "CEFR module preview"],
    },
    href: "/overview/english",
  },
  {
    name: "Nexus AI Arabic",
    label: { id: "Arabic harian Saudi", en: "Saudi daily Arabic" },
    icon: MessageCircle,
    description: {
      id: "Lihat contoh roleplay Arabic harian untuk kerja, umrah, travel, dan percakapan Saudi dengan transliterasi Indonesia.",
      en: "Explore daily Arabic roleplay for work, umrah, travel, and Saudi conversation with Indonesian transliteration.",
    },
    features: {
      id: ["Roleplay harian", "Kartu frasa Arabic", "AI tutor teaser", "Skenario terkunci"],
      en: ["Daily roleplay", "Arabic phrase cards", "AI tutor teaser", "Scenario locked"],
    },
    href: "/overview/arabic",
  },
  {
    name: "Nexus PMP Exam Prep",
    label: { id: "PMP readiness", en: "PMP readiness" },
    icon: ClipboardCheck,
    description: {
      id: "Preview workspace PMP berisi simulator, diagnostic insight, brain dump, dan AI instructor Andromeda.",
      en: "Preview a PMP workspace with simulator, diagnostic insight, brain dump, and Andromeda AI instructor.",
    },
    features: {
      id: ["Preview simulator", "Andromeda teaser", "Diagnostic terkunci", "Checklist readiness"],
      en: ["Simulator preview", "Andromeda teaser", "Diagnostic locked", "Readiness checklist"],
    },
    href: "/overview/pmp",
  },
];

export function AppOverviewSection() {
  const { language } = useLanguage();

  return (
    <div className="mt-8 grid gap-5 lg:grid-cols-2">
      {appOverviews.map((app) => {
        const Icon = app.icon;

        return (
          <article
            key={app.name}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3 text-blue-700">
                <Icon size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  {app.label[language]}
                </p>
                <h3 className="mt-2 text-2xl font-black text-slate-950">{app.name}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{app.description[language]}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {app.features[language].map((feature) => (
                <span
                  key={feature}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700"
                >
                  {feature}
                </span>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link
                href={app.trialHref ?? app.href}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-blue-600 px-4 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95"
              >
                {app.trialHref
                  ? language === "id"
                    ? "Coba trial gratis"
                    : "Try free trial"
                  : language === "id"
                    ? "Overview trial"
                    : "Trial overview"}{" "}
                <ArrowRight size={16} />
              </Link>
              {app.trialHref ? (
                <Link
                  href={app.href}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-blue-100 bg-white px-4 text-sm font-black text-blue-700 transition hover:bg-blue-50 active:scale-95"
                >
                  {language === "id" ? "Lihat overview" : "View overview"}
                </Link>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
