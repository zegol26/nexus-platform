type IttoType = "input" | "toolTechnique" | "output";

type ExplanationContext = {
  itemName: string;
  type: IttoType;
  processName: string;
  knowledgeArea: string;
};

const specificExplanations: Record<string, string> = {
  "enterprise environmental factors":
    "Enterprise Environmental Factors (EEF) adalah kondisi lingkungan yang mempengaruhi cara project dijalankan, tetapi biasanya tidak bisa dikendalikan langsung oleh project manager. Contohnya struktur organisasi, budaya perusahaan, regulasi industri, kondisi pasar, sistem informasi perusahaan, ketersediaan resource, lokasi tim, risk appetite organisasi, dan standar pemerintah. Dalam Develop Project Management Plan, EEF membantu PM memahami batas nyata sebelum menyusun pendekatan project: apakah governance ketat, tim tersebar, compliance tinggi, vendor market terbatas, atau organisasi punya batasan tools tertentu.",
  "organizational process assets":
    "Organizational Process Assets (OPA) adalah aset internal organisasi yang bisa dipakai ulang oleh project. Isinya bisa template, policy, prosedur, lessons learned, historical data, checklist, standard contract, knowledge repository, atau contoh deliverable dari project lama. Bedanya dengan EEF: OPA adalah referensi internal yang bisa dipakai dan diperbarui, sedangkan EEF adalah kondisi lingkungan yang harus diterima sebagai konteks.",
  "project charter":
    "Project Charter adalah dokumen otorisasi awal yang memberi project manager mandat resmi untuk memakai resource organisasi. Charter biasanya berisi business need, tujuan tingkat tinggi, sponsor, high-level scope, milestone besar, budget awal, risiko awal, dan authority PM. Dalam soal PMP, charter sering menjadi sinyal bahwa project baru sah dimulai; sebelum charter jelas, PM belum seharusnya masuk ke detailed planning.",
  "business case":
    "Business Case menjelaskan alasan bisnis kenapa project layak dilakukan. Ia menghubungkan problem/opportunity dengan expected value, cost-benefit, risk, dan pilihan solusi. Dalam PMP, Business Case membantu PM menjaga keputusan tetap selaras dengan value, bukan sekadar menyelesaikan deliverable.",
  "benefits management plan":
    "Benefits Management Plan menjelaskan benefit apa yang diharapkan, kapan muncul, bagaimana diukur, siapa owner benefit, dan bagaimana benefit dipertahankan setelah project selesai. Ini penting karena project success bukan cuma deliverable diterima, tetapi outcome dan value benar-benar terjadi.",
  "outputs from planning processes":
    "Outputs from planning processes adalah hasil dari berbagai proses planning lain yang digabungkan untuk membentuk Project Management Plan. Contohnya scope plan, schedule plan, cost plan, quality plan, resource plan, communication plan, risk plan, procurement plan, dan stakeholder engagement plan. Dalam Develop Project Management Plan, output-output ini disatukan supaya tidak saling bertabrakan.",
  "expert judgment":
    "Expert Judgment berarti menggunakan pengalaman orang yang tepat untuk menilai situasi yang tidak cukup dijawab oleh template. Expert bisa berasal dari SME teknis, PM senior, legal, procurement, compliance, finance, customer, atau tim operasional. Di exam, expert judgment bukan sekadar 'tanya orang pintar', tetapi memilih expertise yang relevan dengan problem.",
  "facilitation":
    "Facilitation adalah kemampuan memandu diskusi agar kelompok bisa mencapai pemahaman, keputusan, atau agreement. PM tidak mendikte jawaban, tetapi membuat proses diskusi jelas: tujuan meeting, aturan bicara, konflik yang dibuka sehat, dan keputusan yang terdokumentasi.",
  "meetings":
    "Meetings adalah forum terstruktur untuk menyelaraskan orang, informasi, dan keputusan. Dalam PMP, meeting yang benar punya tujuan, peserta yang relevan, agenda, output, dan follow-up. Meeting bukan jawaban generik untuk semua masalah; ia tepat saat keputusan perlu shared understanding.",
  "project management plan":
    "Project Management Plan adalah rencana terintegrasi yang menjelaskan bagaimana project akan dijalankan, dipantau, dikontrol, dan ditutup. Ia bukan satu dokumen kecil, tetapi kumpulan baseline dan subsidiary plans. Dalam exam, plan ini adalah rujukan utama sebelum PM mengambil tindakan korektif besar.",
  "change requests":
    "Change Request adalah permintaan formal untuk mengubah baseline, deliverable, dokumen, atau pendekatan project. Change request bisa corrective action, preventive action, defect repair, atau update. Dalam PMP, perubahan signifikan tidak diproses lewat obrolan informal; perlu impact analysis dan change control.",
  "work performance data":
    "Work Performance Data adalah data mentah dari pekerjaan project: persentase selesai, defect count, actual cost, actual duration, milestone status, atau issue yang terjadi. Data ini belum menjadi insight sampai dianalisis.",
  "work performance information":
    "Work Performance Information adalah data yang sudah dianalisis sehingga menjelaskan arti kondisi project. Contohnya variance terhadap baseline, trend keterlambatan, atau kualitas deliverable dibanding acceptance criteria.",
  "work performance reports":
    "Work Performance Reports adalah informasi kinerja yang dikemas untuk decision-making. Report bisa berisi status, forecast, variance, earned value, risk exposure, dan rekomendasi. Di exam, report membantu stakeholder mengambil keputusan, bukan sekadar dokumentasi.",
  "approved change requests":
    "Approved Change Requests adalah perubahan yang sudah melewati otorisasi sesuai change control. Setelah disetujui, perubahan ini harus diimplementasikan dan dampaknya diperbarui ke plan, baseline, dokumen, atau deliverable terkait.",
};

const specificExamTips: Record<string, string> = {
  "enterprise environmental factors":
    "Exam tip: kalau EEF muncul, jangan menganggap PM bebas memilih cara kerja ideal. Cari jawaban yang mempertimbangkan constraint nyata seperti budaya organisasi, regulasi, market condition, governance, resource availability, dan tool perusahaan sebelum menentukan tindakan.",
  "organizational process assets":
    "Exam tip: OPA sering menjadi jawaban saat soal menanyakan 'apa yang harus dicek dulu' untuk belajar dari project sebelumnya atau mengikuti standard internal. Jangan campur dengan EEF: OPA bisa dipakai/diupdate, EEF lebih berupa konteks pembatas.",
  "project charter":
    "Exam tip: sebelum planning detail, pastikan charter dan authority PM jelas. Kalau soal masih di initiating, jawaban yang langsung membuat schedule rinci biasanya terlalu cepat.",
  "project management plan":
    "Exam tip: saat project berjalan dan muncul deviasi, cek plan/baseline dulu sebelum mengambil tindakan besar. PMP suka jawaban yang disciplined, bukan impulsif.",
  "change requests":
    "Exam tip: jika ada perubahan scope, schedule, cost, atau baseline, cari opsi impact analysis lalu change control. Jangan langsung implement hanya karena sponsor atau customer meminta.",
  "expert judgment":
    "Exam tip: pilih expert judgment ketika problem membutuhkan perspektif khusus. Tapi kalau soal punya data cukup untuk dianalisis, jangan jadikan expert judgment sebagai pelarian generik.",
  "facilitation":
    "Exam tip: facilitation kuat untuk conflict, requirements workshop, stakeholder alignment, dan planning integration. Ini sering lebih benar daripada PM membuat keputusan sendirian.",
};

export function buildIttoDescription({
  itemName,
  type,
  processName,
  knowledgeArea,
}: ExplanationContext) {
  const key = itemName.toLowerCase();
  const specific = specificExplanations[key];
  if (specific) return specific;

  if (type === "input") {
    return `${itemName} adalah informasi atau artifact yang dipakai sebelum ${processName} mengambil keputusan di area ${knowledgeArea}. Dalam ITTO, input bukan sesuatu untuk dihafal sebagai daftar, tetapi petunjuk alur berpikir: PM harus memahami konteks, constraint, baseline, stakeholder need, dan data yang relevan sebelum memilih tools atau menghasilkan output.`;
  }

  if (type === "toolTechnique") {
    return `${itemName} adalah cara kerja, analisis, atau skill yang membantu PM mengubah input menjadi keputusan yang lebih reliable dalam ${processName}. Tools & Techniques menjawab pertanyaan 'bagaimana PM berpikir atau memfasilitasi keputusan', bukan sekadar nama metode.`;
  }

  return `${itemName} adalah hasil dari ${processName} yang memberi arah baru pada project: bisa berupa rencana, baseline, deliverable, keputusan, update dokumen, atau informasi kinerja. Output penting karena biasanya menjadi input untuk proses berikutnya dan mengubah cara tim bekerja.`;
}

export function buildIttoExample({ itemName, type, processName }: ExplanationContext) {
  if (itemName.toLowerCase() === "enterprise environmental factors") {
    return "Contoh: tim Nexus membuat rencana implementasi LMS untuk klien pemerintah. Karena ada aturan pengadaan, approval berlapis, dan tim pengguna tersebar di beberapa kota, PM menyesuaikan communication plan, risk approach, timeline approval, dan procurement strategy sejak awal.";
  }

  if (itemName.toLowerCase() === "organizational process assets") {
    return "Contoh: sebelum membuat plan, PM mengambil template risk register, lessons learned project LMS sebelumnya, checklist acceptance, dan standard reporting perusahaan supaya planning tidak mulai dari nol.";
  }

  if (type === "input") {
    return `Contoh: sebelum menjalankan ${processName}, PM mengecek ${itemName} agar keputusan tidak lepas dari konteks project dan ekspektasi stakeholder.`;
  }

  if (type === "toolTechnique") {
    return `Contoh: dalam ${processName}, PM memakai ${itemName} untuk mengubah diskusi atau data mentah menjadi keputusan yang bisa dijelaskan ke sponsor dan tim.`;
  }

  return `Contoh: setelah ${processName}, ${itemName} menjadi artifact yang dipakai tim untuk melanjutkan pekerjaan, mengontrol perubahan, atau menyelaraskan stakeholder.`;
}

export function buildIttoExamTip({ itemName, type, knowledgeArea }: ExplanationContext) {
  const key = itemName.toLowerCase();
  const specific = specificExamTips[key];
  if (specific) return specific;

  if (type === "input") {
    return `Exam tip: ketika ${itemName} muncul sebagai input, pikirkan 'informasi apa yang harus dipahami sebelum PM bertindak?' Untuk ${knowledgeArea}, jawaban terbaik biasanya membaca konteks dulu, lalu memilih action yang terukur.`;
  }

  if (type === "toolTechnique") {
    return `Exam tip: ${itemName} biasanya benar saat soal meminta cara menganalisis, menyelaraskan orang, atau memilih pendekatan sebelum aksi final. Hindari opsi yang langsung lompat ke implementasi tanpa proses berpikir.`;
  }

  return `Exam tip: ${itemName} biasanya muncul setelah proses yang tepat dilakukan. Kalau opsi jawaban langsung menghasilkan output tanpa input/analisis yang cukup, curigai sebagai distractor.`;
}
