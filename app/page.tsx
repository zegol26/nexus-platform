import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  GraduationCap,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { MarketingFooter, MarketingNav } from "@/components/layout/MarketingChrome";
import { AppOverviewSection } from "@/components/marketing/AppOverviewSection";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return (
    <div className="nexus-market-shell min-h-screen text-slate-950">
      <MarketingNav />
      <main>
        <section className="mx-auto grid min-h-[680px] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-2 text-sm font-extrabold text-blue-700 shadow-sm">
              <Sparkles size={16} /> Promo launch 50%
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[1.02] tracking-normal text-slate-950 sm:text-6xl">
              Nexus Talenta Indonesia Academy
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Belajar bahasa Jepang, English interview, Arabic harian, dan PMP prep
              lewat apps Nexus. Semua produk dapat dilihat, diorder, dan dibayar dari
              platform yang sama.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/checkout" className="nexus-primary">
                Order Program <ShoppingCart size={18} />
              </Link>
              <Link href="/login" className="nexus-secondary">
                Masuk Platform <ArrowRight size={18} />
              </Link>
            </div>
            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {["Bisa order online", "Deskripsi layanan jelas", "Checkout resmi"].map(
                (item) => (
                  <div key={item} className="flex items-center gap-2 text-sm font-extrabold text-slate-700">
                    <CheckCircle2 className="text-green-600" size={18} /> {item}
                  </div>
                )
              )}
            </div>
          </div>

          <div className="nexus-glass min-w-0 rounded-[28px] p-4">
            <div className="rounded-[22px] bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between">
                <p className="text-sm font-extrabold text-sky-200">Nexus Academy</p>
                <span className="rounded-full bg-green-400/15 px-3 py-1 text-xs font-extrabold text-green-200">
                  Live App
                </span>
              </div>
              <div className="mt-7 rounded-2xl bg-white p-4 text-slate-950">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-blue-600 p-3 text-white">
                    <BrainCircuit size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-500">Latihan hari ini</p>
                    <h2 className="mt-1 text-2xl font-black">Self-introduction interview</h2>
                  </div>
                </div>
                <div className="mt-5 grid gap-3">
                  {["Watashi no namae wa.", "Kibou shokushu wa.", "Nihon de hatarakitai desu"].map(
                    (phrase) => (
                      <div key={phrase} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm">
                        {phrase}
                      </div>
                    )
                  )}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  ["86%", "Progress"],
                  ["18", "Streak"],
                  ["N4", "Target"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl bg-white/10 p-4">
                    <p className="text-2xl font-black">{value}</p>
                    <p className="text-xs text-slate-300">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="program" className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="font-extrabold text-blue-700">Nexus learning apps</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
                Empat workspace belajar dalam satu platform.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Nexus Talenta Indonesia Academy menyatukan app bahasa dan exam prep
                yang fokus pada latihan aktif: chat, speaking, adaptive learning,
                progress tracking, dan mock test yang bisa dipakai berulang.
              </p>
            </div>

            <AppOverviewSection />

            <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-black text-slate-950">Mulai dari app yang paling relevan untuk target kamu.</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Setelah login, pilihan program dan billing akan mengikuti paket yang tersedia di platform.
                </p>
              </div>
              <Link href="/checkout" className="nexus-primary shrink-0">
                Lihat program <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-5 md:grid-cols-3">
              {[
                ["Academy dashboard", "Pantau kelas, modul, target belajar, dan rekomendasi harian."],
                ["AI practice", "Latihan speaking, writing, quiz, dan flashcards dengan koreksi instan."],
                ["Career readiness", "Sambungkan pembelajaran dengan event, webinar, dan persiapan karier global."],
              ].map(([title, desc]) => (
                <div key={title} className="nexus-card rounded-2xl p-6">
                  <GraduationCap className="text-blue-700" size={30} />
                  <h3 className="mt-4 text-xl font-black text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 text-white shadow-xl shadow-blue-950/10">
              <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.22em] text-sky-200">
                    Custom AI learning apps
                  </p>
                  <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight">
                    Ingin punya app belajar dengan AI support untuk organisasi Anda?
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                    Nexus Talenta Indonesia dapat membantu sekolah, perusahaan,
                    training center, dan UMKM membuat ruang belajar digital yang lebih
                    hidup: materi terstruktur, AI chat, AI talk, quiz, progress tracking,
                    dan mock test sesuai kebutuhan program.
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-black text-slate-950 transition hover:bg-sky-100"
                >
                  Contact kami <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
