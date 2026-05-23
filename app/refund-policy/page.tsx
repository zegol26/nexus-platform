import { MarketingFooter, MarketingNav } from "@/components/layout/MarketingChrome";
import { nexusContact } from "@/lib/nexus/marketing";

export default function RefundPolicyPage() {
  const sections = [
    ["Tidak ada pengembalian dana", "Setelah pembayaran berhasil dan akses akun/program diberikan, transaksi dianggap final dan tidak dapat dibatalkan atau dikembalikan dananya."],
    ["Tidak ada retur produk digital", "Materi, latihan AI, akses kelas, kupon, dan benefit digital lain tidak dapat dikembalikan karena telah tersedia untuk digunakan oleh pembeli."],
    ["Kompensasi teknis", "Apabila terjadi kendala teknis yang terbukti berasal dari sistem Nexus dan menghambat akses, tim kami akan membantu pemulihan akses, perpanjangan masa akses yang wajar, atau solusi teknis lain sesuai evaluasi internal."],
    ["Alasan kebijakan", "Harga layanan Nexus dibuat ekonomis agar lebih banyak talenta Indonesia dapat mencoba pembelajaran digital. Dengan struktur biaya tersebut, opsi penjaminan kualitas berbasis pengembalian dana belum dapat kami hadirkan."],
    ["Bantuan", `Untuk kendala akses, hubungi ${nexusContact.email} dengan menyertakan nama pembeli, email akun, nomor WhatsApp, bukti pembayaran, dan program yang dibeli.`],
  ];

  return (
    <div className="nexus-market-shell min-h-screen text-slate-950">
      <MarketingNav />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <article className="nexus-card rounded-2xl p-6 sm:p-10">
          <p className="font-extrabold text-blue-700">Kebijakan layanan</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">
            Kebijakan Pengembalian Dana dan Produk
          </h1>
          <p className="mt-4 leading-7 text-slate-600">
            Nexus Talenta Indonesia Academy adalah layanan digital berbiaya terjangkau
            yang dirancang agar pembelajar dapat mulai latihan dengan akses yang ringan.
            Karena karakter layanan bersifat digital, akses diberikan segera setelah
            pembayaran terkonfirmasi, dan biaya program kami dibuat rendah, Nexus Talenta
            Indonesia Academy saat ini belum menghadirkan opsi pengembalian dana atau
            penjaminan kualitas berbasis refund.
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
