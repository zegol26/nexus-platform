import { MarketingFooter, MarketingNav } from "@/components/layout/MarketingChrome";
import { nexusContact } from "@/lib/nexus/marketing";

export default function TermsPage() {
  const sections = [
    ["Layanan", "Nexus menyediakan akses modul belajar bahasa Jepang, latihan AI, materi persiapan karier global, quiz, flashcards, dan aktivitas pembelajaran digital sesuai paket yang dipilih pembeli."],
    ["Pemesanan", "Pembeli wajib mengisi data yang benar saat melakukan pemesanan. Akses layanan diberikan setelah pembayaran terkonfirmasi dan data akun berhasil dibuat."],
    ["Penggunaan akun", "Akun bersifat personal dan tidak boleh dipindahtangankan, dijual kembali, atau dipakai untuk aktivitas yang mengganggu layanan."],
    ["Materi dan hasil belajar", "Materi disediakan untuk mendukung proses belajar. Hasil belajar bergantung pada konsistensi peserta, latar belakang kemampuan, dan kepatuhan mengikuti aktivitas."],
    ["Pembayaran", "Pembayaran dilakukan melalui kanal pembayaran yang tersedia. Biaya administrasi pihak ketiga, bila ada, mengikuti ketentuan penyedia pembayaran."],
    ["Kontak resmi", `Pertanyaan layanan dapat dikirim ke ${nexusContact.email} atau kantor ${nexusContact.company} di ${nexusContact.address}`],
  ];

  return (
    <div className="nexus-market-shell min-h-screen text-slate-950">
      <MarketingNav />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <article className="nexus-card rounded-2xl p-6 sm:p-10">
          <p className="font-extrabold text-blue-700">Legal</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">Syarat dan Ketentuan</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Berlaku untuk pembelian dan penggunaan layanan digital {nexusContact.academy}{" "}
            dan program pelatihan online yang tersedia di platform.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {sections.map(([title, body]) => (
              <section key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-xl font-black text-slate-950">{title}</h2>
                <p className="mt-2 leading-7 text-slate-600">{body}</p>
              </section>
            ))}
          </div>
        </article>
      </main>
      <MarketingFooter />
    </div>
  );
}
