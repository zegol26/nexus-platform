import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  GraduationCap,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { LocalizedText } from "@/components/i18n/LocalizedText";
import type { UiTextKey } from "@/components/i18n/dictionary";
import { MarketingFooter, MarketingNav } from "@/components/layout/MarketingChrome";
import { AppOverviewSection } from "@/components/marketing/AppOverviewSection";
import { academySeoKeywords, getAcademySiteUrl } from "@/lib/seo";

const featureProofs: UiTextKey[] = [
  "marketing.proofOrder",
  "marketing.proofDescription",
  "marketing.proofCheckout",
];

const academyCards: Array<{ title: UiTextKey; description: UiTextKey }> = [
  { title: "marketing.cardDashboard", description: "marketing.cardDashboardCopy" },
  { title: "marketing.cardPractice", description: "marketing.cardPracticeCopy" },
  { title: "marketing.cardCareer", description: "marketing.cardCareerCopy" },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const siteUrl = getAcademySiteUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": `${siteUrl}/#organization`,
        name: "Nexus Talenta Indonesia Academy",
        legalName: "PT Nexus Talenta Indonesia",
        url: siteUrl,
        logo: `${siteUrl}/icon.png`,
        email: "info@nexustalenta.com",
        telephone: "+62-811-89-25-99",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Jalan Ciledug Raya No. 2A RT01/RW01 Petukangan Utara",
          addressLocality: "Jakarta Selatan",
          postalCode: "12260",
          addressCountry: "ID",
        },
        sameAs: ["https://nexustalenta.com/", "https://nexustalenta-karir.com/"],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "Nexus Talenta Indonesia Academy",
        url: siteUrl,
        inLanguage: ["id-ID", "en-US"],
        publisher: { "@id": `${siteUrl}/#organization` },
        keywords: academySeoKeywords.join(", "),
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl}/#courses`,
        name: "Nexus Talenta Indonesia Academy Programs",
        itemListElement: [
          "Nexus AI Nihongo",
          "Nexus AI English",
          "Nexus AI Arabic",
          "Nexus PMP Exam Prep",
        ].map((name, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Course",
            name,
            provider: { "@id": `${siteUrl}/#organization` },
          },
        })),
      },
    ],
  };

  return (
    <div className="nexus-market-shell min-h-screen text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MarketingNav />
      <main>
        <section className="mx-auto grid min-h-[680px] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-2 text-sm font-extrabold text-blue-700 shadow-sm">
              <Sparkles size={16} /> <LocalizedText id="marketing.heroPromo" />
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[1.02] tracking-normal text-slate-950 sm:text-6xl">
              Nexus Talenta Indonesia Academy
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              <LocalizedText id="marketing.heroCopy" />
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/checkout" className="nexus-primary">
                <LocalizedText id="marketing.orderProgram" /> <ShoppingCart size={18} />
              </Link>
              <Link href="/login" className="nexus-secondary">
                <LocalizedText id="marketing.enterPlatform" /> <ArrowRight size={18} />
              </Link>
            </div>
            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {featureProofs.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm font-extrabold text-slate-700">
                    <CheckCircle2 className="text-green-600" size={18} /> <LocalizedText id={item} />
                  </div>
                ))}
            </div>
          </div>

          <div className="nexus-glass min-w-0 rounded-[28px] p-4">
            <div className="rounded-[22px] bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between">
                <p className="text-sm font-extrabold text-sky-200">Nexus Academy</p>
                <span className="rounded-full bg-green-400/15 px-3 py-1 text-xs font-extrabold text-green-200">
                  <LocalizedText id="marketing.liveApp" />
                </span>
              </div>
              <div className="mt-7 rounded-2xl bg-white p-4 text-slate-950">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-blue-600 p-3 text-white">
                    <BrainCircuit size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-500"><LocalizedText id="marketing.todayPractice" /></p>
                    <h2 className="mt-1 text-2xl font-black"><LocalizedText id="marketing.practiceTitle" /></h2>
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
                  ["86%", "marketing.progress"],
                  ["18", "marketing.streak"],
                  ["N4", "marketing.target"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl bg-white/10 p-4">
                    <p className="text-2xl font-black">{value}</p>
                    <p className="text-xs text-slate-300"><LocalizedText id={label as UiTextKey} /></p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="program" className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="font-extrabold text-blue-700"><LocalizedText id="marketing.appsEyebrow" /></p>
              <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
                <LocalizedText id="marketing.appsTitle" />
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                <LocalizedText id="marketing.appsCopy" />
              </p>
            </div>

            <AppOverviewSection />

            <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-black text-slate-950"><LocalizedText id="marketing.relevantStart" /></p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  <LocalizedText id="marketing.relevantCopy" />
                </p>
              </div>
              <Link href="/checkout" className="nexus-primary shrink-0">
                <LocalizedText id="marketing.viewPrograms" /> <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-5 md:grid-cols-3">
              {academyCards.map((card) => (
                <div key={card.title} className="nexus-card rounded-2xl p-6">
                  <GraduationCap className="text-blue-700" size={30} />
                  <h3 className="mt-4 text-xl font-black text-slate-950"><LocalizedText id={card.title} /></h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600"><LocalizedText id={card.description} /></p>
                </div>
              ))}
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 text-white shadow-xl shadow-blue-950/10">
              <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.22em] text-sky-200">
                    <LocalizedText id="marketing.customEyebrow" />
                  </p>
                  <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight">
                    <LocalizedText id="marketing.customTitle" />
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                    <LocalizedText id="marketing.customCopy" />
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-black text-slate-950 transition hover:bg-sky-100"
                >
                  <LocalizedText id="marketing.contactUs" /> <ArrowRight size={18} />
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
