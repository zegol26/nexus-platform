import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  ClipboardCheck,
  MessageCircle,
  Mic2,
  type LucideIcon,
} from "lucide-react";

type AppOverview = {
  name: string;
  label: string;
  icon: LucideIcon;
  description: string;
  features: string[];
  href: string;
};

const appOverviews: AppOverview[] = [
  {
    name: "Nexus AI Nihongo",
    label: "Japanese learning",
    icon: BrainCircuit,
    description:
      "Mini workspace Jepang untuk melihat rasa dashboard, AI tutor, flashcard, dan jalur latihan JLPT/JFT sebelum berlangganan.",
    features: ["AI tutor teaser", "Flashcard preview", "Reading & listening locked", "Mock test preview"],
    href: "/overview/nihongo",
  },
  {
    name: "Nexus AI English",
    label: "Interview & conversation",
    icon: Mic2,
    description:
      "Coba tampilan interview practice, John AI coach, CEFR track, dan recording review dalam mode preview terbatas.",
    features: ["John coach teaser", "Interview prompt", "Recording locked", "CEFR module preview"],
    href: "/overview/english",
  },
  {
    name: "Nexus AI Arabic",
    label: "Saudi daily Arabic",
    icon: MessageCircle,
    description:
      "Lihat contoh roleplay Arabic harian untuk kerja, umrah, travel, dan percakapan Saudi dengan transliterasi Indonesia.",
    features: ["Daily roleplay", "Arabic phrase cards", "AI tutor teaser", "Scenario locked"],
    href: "/overview/arabic",
  },
  {
    name: "Nexus PMP Exam Prep",
    label: "PMP readiness",
    icon: ClipboardCheck,
    description:
      "Preview workspace PMP berisi simulator, diagnostic insight, brain dump, dan AI instructor Andromeda.",
    features: ["Simulator preview", "Andromeda teaser", "Diagnostic locked", "Readiness checklist"],
    href: "/overview/pmp",
  },
];

export function AppOverviewSection() {
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
                  {app.label}
                </p>
                <h3 className="mt-2 text-2xl font-black text-slate-950">{app.name}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{app.description}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {app.features.map((feature) => (
                <span
                  key={feature}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700"
                >
                  {feature}
                </span>
              ))}
            </div>

            <Link
              href={app.href}
              className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-blue-600 px-4 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95"
            >
              Overview trial <ArrowRight size={16} />
            </Link>
          </article>
        );
      })}
    </div>
  );
}
