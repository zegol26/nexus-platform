import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  Headphones,
  LockKeyhole,
  MessageCircle,
  Mic2,
  PlayCircle,
  Sparkles,
} from "lucide-react";

type OverviewApp = {
  slug: string;
  name: string;
  coach: string;
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  sidebar: string[];
  stats: Array<[string, string]>;
  chat: Array<[string, string]>;
  modules: Array<[string, string, string]>;
  action: {
    icon: "chat" | "mic" | "book" | "quiz";
    title: string;
    body: string;
  };
};

const apps: Record<string, OverviewApp> = {
  nihongo: {
    slug: "nihongo",
    name: "Nexus AI Nihongo",
    coach: "Ai-chan",
    eyebrow: "Japanese learning preview",
    title: "Rasakan ruang belajar Jepang sebelum subscribe.",
    description:
      "Preview ini memperlihatkan dashboard, AI tutor, flashcard, dan jalur latihan JLPT/JFT. Input chat, reading, listening, dan mock test penuh dibuka setelah login dan aktif berlangganan.",
    accent: "from-blue-600 to-cyan-500",
    sidebar: ["Dashboard", "AI Tutor", "Flashcards", "Reading", "Listening", "Mock Test N4/N5"],
    stats: [["N4/N5", "Target track"], ["12", "Flashcard deck"], ["AI", "Tutor preview"]],
    chat: [
      ["Ai-chan", "Konnichiwa. Hari ini kita lihat pola kalimat dasar: A wa B desu."],
      ["Learner", "Aku bisa lihat contoh dan romaji dulu?"],
      ["Ai-chan", "Bisa. Watashi wa gakusei desu = saya adalah pelajar."],
    ],
    modules: [
      ["Reading", "Locked", "Preview daftar teks pendek dan target kosakata."],
      ["Listening", "Locked", "Preview audio drill untuk shadowing dan dikte."],
      ["Mock Test", "Preview", "Contoh format soal N4/N5 tanpa skor final."],
    ],
    action: {
      icon: "chat",
      title: "AI tutor dibatasi di trial",
      body: "Calon user bisa melihat pola percakapan, tapi belum bisa mengirim pertanyaan baru.",
    },
  },
  english: {
    slug: "english",
    name: "Nexus AI English",
    coach: "John",
    eyebrow: "Interview and conversation preview",
    title: "Lihat alur interview practice dan AI coaching.",
    description:
      "Trial ini menampilkan prompt interview, John AI coach, CEFR path, dan recording review. Recording dan feedback personal tetap dikunci untuk member.",
    accent: "from-indigo-600 to-blue-500",
    sidebar: ["Interview", "John AI Coach", "DCE A1-C1", "Recording Review", "Voice Roleplay"],
    stats: [["A1-C1", "CEFR path"], ["Voice", "Recording flow"], ["Review", "Coach feedback"]],
    chat: [
      ["John", "Tell me about your current role and the kind of job you want abroad."],
      ["Learner", "I want to practice a simple answer first."],
      ["John", "Good. Keep it clear: current role, main skill, and target opportunity."],
    ],
    modules: [
      ["Interview prompt", "Preview", "Contoh pertanyaan HR dan structure jawaban."],
      ["Recording", "Locked", "Mic hanya aktif setelah login dan akses program aktif."],
      ["DCE lesson", "Locked", "Reading, listening, grammar, dialogue, roleplay."],
    ],
    action: {
      icon: "mic",
      title: "Recording belum aktif",
      body: "Tombol mic sengaja dikunci di overview agar user melihat flow tanpa submit suara.",
    },
  },
  arabic: {
    slug: "arabic",
    name: "Nexus AI Arabic",
    coach: "Arabic Tutor",
    eyebrow: "Saudi daily Arabic preview",
    title: "Preview Arabic praktis untuk kerja, travel, dan umrah.",
    description:
      "Calon user bisa melihat contoh roleplay, transliterasi, arti Indonesia, dan format phrase card. Scenario penuh dan chat tutor dibuka setelah login.",
    accent: "from-emerald-600 to-teal-500",
    sidebar: ["Daily Arabic", "Work Arabic", "Umrah Arabic", "Travel", "AI Tutor", "Scenario Roleplay"],
    stats: [["Daily", "Survival phrases"], ["Saudi", "Conversation"], ["AI", "Tutor preview"]],
    chat: [
      ["Tutor", "Ahlan. Kita coba situasi taksi: Abgha arooh il-funduq."],
      ["Learner", "Artinya aku mau pergi ke hotel, ya?"],
      ["Tutor", "Betul. Abgha = saya ingin, arooh = pergi, il-funduq = hotel."],
    ],
    modules: [
      ["Daily survival", "Preview", "Sapaan, arah, angka, dan request sederhana."],
      ["Work Arabic", "Locked", "Percakapan tempat kerja dan instruksi dasar."],
      ["Umrah Arabic", "Locked", "Situasi masjid, hotel, transport, dan bantuan."],
    ],
    action: {
      icon: "chat",
      title: "Scenario roleplay terbatas",
      body: "Trial menampilkan contoh rasa roleplay, tapi tidak menyimpan progress percakapan.",
    },
  },
  pmp: {
    slug: "pmp",
    name: "Nexus PMP Exam Prep",
    coach: "Andromeda",
    eyebrow: "PMP readiness preview",
    title: "Lihat workspace latihan judgment ala PMI.",
    description:
      "Preview ini menampilkan simulator question, diagnostic insight, readiness checklist, dan AI instructor. Skor, report detail, dan full simulator dibuka untuk member.",
    accent: "from-slate-800 to-blue-700",
    sidebar: ["Course Path", "Simulator 30/60/180", "Andromeda AI", "Diagnostic", "Brain Dump", "Readiness"],
    stats: [["180", "Full simulator"], ["AI", "Instructor"], ["Report", "Diagnostic"]],
    chat: [
      ["Andromeda", "The key is not memorizing PMBOK terms. Read the situation and choose the best next action."],
      ["Learner", "So I should avoid jumping straight to escalation?"],
      ["Andromeda", "Correct. First assess, communicate, and follow the process unless the scenario says otherwise."],
    ],
    modules: [
      ["Simulator sample", "Preview", "Satu contoh soal untuk melihat gaya pertanyaan."],
      ["Diagnostic report", "Locked", "Domain, trap pattern, dan weakness insight."],
      ["Brain dump", "Locked", "Formula, mindset, dan checklist hari ujian."],
    ],
    action: {
      icon: "quiz",
      title: "Simulator hanya teaser",
      body: "Pilihan jawaban terlihat, tapi scoring dan report penuh hanya aktif setelah subscribe.",
    },
  },
};

const iconMap = {
  book: BookOpen,
  chat: MessageCircle,
  mic: Mic2,
  quiz: ClipboardCheck,
};

export function generateStaticParams() {
  return Object.keys(apps).map((app) => ({ app }));
}

export default async function OverviewTrialPage({
  params,
}: {
  params: Promise<{ app: string }>;
}) {
  const { app } = await params;
  const data = apps[app];

  if (!data) {
    notFound();
  }

  const ActionIcon = iconMap[data.action.icon];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className={`bg-gradient-to-br ${data.accent} text-white`}>
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/#program"
              className="inline-flex items-center gap-2 text-sm font-black text-white/90 transition hover:text-white"
            >
              <ArrowLeft size={18} /> Kembali ke program
            </Link>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/register"
                className="inline-flex min-h-10 items-center justify-center rounded-full bg-white px-4 text-sm font-black text-blue-700 transition hover:bg-blue-50"
              >
                Register
              </Link>
              <Link
                href="/checkout"
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/35 px-4 text-sm font-black text-white transition hover:bg-white/10"
              >
                Order program
              </Link>
            </div>
          </div>

          <section className="grid gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-white/75">
                {data.eyebrow}
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
                {data.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/82">
                {data.description}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {data.stats.map(([value, label]) => (
                <div key={`${value}-${label}`} className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/16 backdrop-blur">
                  <p className="text-2xl font-black">{value}</p>
                  <p className="mt-1 text-xs font-bold text-white/75">{label}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl shadow-blue-950/10">
          <div className="grid min-h-[620px] lg:grid-cols-[280px_1fr]">
            <aside className="border-b border-slate-200 bg-slate-950 p-4 text-white lg:border-b-0 lg:border-r">
              <div className="flex items-center gap-3 rounded-2xl bg-white/8 p-3">
                <div className="rounded-xl bg-blue-500 p-2">
                  <BrainCircuit size={22} />
                </div>
                <div>
                  <p className="text-sm font-black">{data.name}</p>
                  <p className="text-xs font-bold text-slate-400">Trial overview</p>
                </div>
              </div>
              <nav className="mt-5 grid gap-2">
                {data.sidebar.map((item, index) => (
                  <button
                    key={item}
                    type="button"
                    disabled={index > 1}
                    className={`flex min-h-11 items-center justify-between rounded-xl px-3 text-left text-sm font-bold transition ${
                      index === 0
                        ? "bg-white text-slate-950"
                        : index === 1
                          ? "bg-white/10 text-white"
                          : "cursor-not-allowed bg-white/5 text-slate-500"
                    }`}
                  >
                    <span>{item}</span>
                    {index > 1 ? <LockKeyhole size={15} /> : null}
                  </button>
                ))}
              </nav>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/6 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-200">
                  Preview mode
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Module bisa dilihat sebagai teaser. Interaksi penuh aktif setelah login dan akses program aktif.
                </p>
              </div>
            </aside>

            <div className="bg-slate-50 p-4 sm:p-6 lg:p-8">
              <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">
                        Live-like preview
                      </p>
                      <h2 className="mt-2 text-2xl font-black">{data.name}</h2>
                    </div>
                    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-black text-amber-800">
                      <LockKeyhole size={14} /> Restricted trial
                    </span>
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-blue-600 p-3 text-white">
                        <ActionIcon size={24} />
                      </div>
                      <div>
                        <h3 className="font-black">{data.action.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{data.action.body}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {data.chat.map(([speaker, text]) => (
                      <div
                        key={`${speaker}-${text}`}
                        className={`max-w-[86%] rounded-2xl p-4 text-sm leading-6 ${
                          speaker === "Learner"
                            ? "ml-auto bg-blue-600 text-white"
                            : "border border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        <p className={`mb-1 text-xs font-black ${speaker === "Learner" ? "text-blue-100" : "text-blue-700"}`}>
                          {speaker}
                        </p>
                        {text}
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row">
                    <input
                      disabled
                      value={`Login untuk ngobrol dengan ${data.coach}`}
                      readOnly
                      className="min-h-12 flex-1 rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm font-bold text-slate-500"
                    />
                    <button
                      type="button"
                      disabled
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-300 px-5 text-sm font-black text-slate-500"
                    >
                      <LockKeyhole size={16} /> Locked
                    </button>
                  </div>
                </section>

                <aside className="grid gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                      Feature map
                    </p>
                    <div className="mt-4 grid gap-3">
                      {data.modules.map(([title, status, body]) => (
                        <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-black">{title}</p>
                            <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-black text-blue-700">
                              {status}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                    <div className="flex items-start gap-3">
                      <Sparkles className="mt-1 text-blue-700" size={22} />
                      <div>
                        <p className="font-black text-slate-950">Buka akses penuh</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Login atau register untuk masuk ke dashboard, menyimpan progress, dan membuka practice lengkap.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2">
                      <Link
                        href="/login"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white transition hover:bg-blue-700"
                      >
                        Login <CheckCircle2 size={16} />
                      </Link>
                      <Link
                        href="/checkout"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 text-sm font-black text-blue-700 transition hover:bg-blue-50"
                      >
                        Lihat paket <PlayCircle size={16} />
                      </Link>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
