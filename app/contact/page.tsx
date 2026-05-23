import { Mail, MapPin, Phone } from "lucide-react";
import { MarketingFooter, MarketingNav } from "@/components/layout/MarketingChrome";
import { nexusContact } from "@/lib/nexus/marketing";

export default function ContactPage() {
  return (
    <div className="nexus-market-shell min-h-screen text-slate-950">
      <MarketingNav />
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <section>
          <p className="font-extrabold text-blue-700">Contact</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950 sm:text-5xl">
            Hubungi Nexus Talenta Indonesia
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Untuk pertanyaan pembelian, akses platform, kerja sama academy, atau
            bantuan layanan Nexus AI Nihongo.
          </p>
          <div className="mt-8 grid gap-4">
            <div className="nexus-card rounded-2xl p-5">
              <Mail className="text-blue-700" />
              <p className="mt-3 font-black text-slate-950">Email</p>
              <p className="text-slate-600">{nexusContact.email}</p>
              <p className="text-slate-600">{nexusContact.businessEmail}</p>
            </div>
            <div className="nexus-card rounded-2xl p-5">
              <Phone className="text-blue-700" />
              <p className="mt-3 font-black text-slate-950">Phone</p>
              <p className="text-slate-600">{nexusContact.phones}</p>
            </div>
            <div className="nexus-card rounded-2xl p-5">
              <MapPin className="text-blue-700" />
              <p className="mt-3 font-black text-slate-950">Address</p>
              <p className="text-slate-600">{nexusContact.address}</p>
            </div>
          </div>
        </section>
        <section className="nexus-card h-fit rounded-2xl p-6">
          <h2 className="text-2xl font-black text-slate-950">Form bantuan</h2>
          <form className="mt-6 grid gap-4">
            <input className="nexus-field" placeholder="Nama" />
            <input className="nexus-field" type="email" placeholder="Email" />
            <input className="nexus-field" placeholder="Nomor WhatsApp" />
            <select className="nexus-field" defaultValue="Pembelian program">
              <option>Pembelian program</option>
              <option>Akses akun</option>
              <option>Kerja sama academy</option>
              <option>Informasi kelas</option>
            </select>
            <textarea className="nexus-field min-h-36 resize-y" placeholder="Tulis pesan Anda" />
            <button type="button" className="nexus-primary">Kirim pesan</button>
          </form>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
