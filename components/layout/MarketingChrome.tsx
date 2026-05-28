import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { LocalizedText } from "@/components/i18n/LocalizedText";
import { nexusContact, nexusLogoUrl } from "@/lib/nexus/marketing";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/90 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image
            src={nexusLogoUrl}
            alt="Nexus Talenta Indonesia"
            width={168}
            height={48}
            className="h-10 w-auto"
            priority
          />
          <span className="hidden text-sm font-extrabold text-slate-950 sm:inline">
            Nexus Talenta Indonesia Academy
          </span>
        </Link>

        <div className="hidden items-center gap-6 text-sm font-bold text-slate-600 md:flex">
          <Link href="/#program"><LocalizedText id="nav.program" /></Link>
          <Link href="/terms"><LocalizedText id="marketing.nav.terms" /></Link>
          <Link href="/refund-policy">Refund</Link>
          <Link href="/contact"><LocalizedText id="marketing.nav.contact" /></Link>
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle compact />
          <Link
            href="/login"
            className="hidden min-h-11 items-center justify-center rounded-full border border-blue-100 bg-white px-5 text-sm font-extrabold text-slate-950 shadow-sm sm:inline-flex"
          >
            <LocalizedText id="marketing.nav.login" />
          </Link>
          <Link
            href="/checkout"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
          >
            <LocalizedText id="marketing.nav.order" />
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src={nexusLogoUrl}
              alt="Nexus Talenta Indonesia"
              width={184}
              height={52}
              className="h-11 w-auto"
            />
            <div>
              <p className="font-extrabold text-slate-950">{nexusContact.academy}</p>
              <p className="text-sm text-slate-500"><LocalizedText id="marketing.footerTagline" /></p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">
            <LocalizedText id="marketing.footerCopy" />
          </p>
        </div>

        <div>
          <p className="font-extrabold text-slate-950"><LocalizedText id="marketing.footerLegal" /></p>
          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <Link href="/terms"><LocalizedText id="marketing.footerTerms" /></Link>
            <Link href="/refund-policy"><LocalizedText id="marketing.footerRefund" /></Link>
            <Link href="/checkout"><LocalizedText id="marketing.orderProgram" /></Link>
            <Link href="https://nexustalenta-karir.com/"><LocalizedText id="marketing.footerCareer" /></Link>
          </div>
        </div>

        <div>
          <p className="font-extrabold text-slate-950"><LocalizedText id="marketing.footerContact" /></p>
          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <span className="flex gap-2">
              <Mail size={16} /> {nexusContact.email}
            </span>
            <span className="flex gap-2">
              <Phone size={16} /> {nexusContact.phones}
            </span>
            <span className="flex gap-2">
              <MapPin size={16} /> {nexusContact.address}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
