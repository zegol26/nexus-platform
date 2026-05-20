type GlossaryCopy = {
  example: string;
  pmpMindset: string;
};

const SPECIFIC_COPY: Record<string, GlossaryCopy> = {
  "Burnup Chart": {
    example:
      "Contoh: tim agile sedang membangun portal rekrutmen. Setelah empat sprint, garis completed work naik stabil, tetapi garis total scope ikut naik karena stakeholder menambah fitur screening dokumen. Burnup Chart membantu project manager melihat bahwa masalahnya bukan sekadar tim lambat, melainkan scope bertambah; jawaban PMP yang kuat biasanya mengklarifikasi value, menata ulang backlog bersama Product Owner, dan membuat dampak scope terlihat ke sponsor.",
    pmpMindset:
      "Exam tip: Burnup Chart membaca dua cerita sekaligus: pekerjaan selesai dan total scope. Kalau completed naik tetapi target ikut menjauh, jangan langsung menekan tim; cek scope change, priority, dan stakeholder alignment.",
  },
  "Burndown Chart": {
    example:
      "Contoh: sprint punya 80 story points dan di hari ke-7 masih tersisa 55. Burndown Chart menunjukkan burn rate tertinggal dari garis ideal, tetapi penyebabnya belum jelas. Dalam soal PMP/agile, langkah terbaik bukan langsung minta overtime, melainkan fasilitasi tim melihat blocker, ukuran story, dependency, atau work in progress yang terlalu banyak.",
    pmpMindset:
      "Exam tip: Burndown adalah sinyal early warning, bukan alat menghukum tim. Pilih jawaban yang membuat hambatan transparan dan membantu team self-correct.",
  },
  "Cumulative Flow Diagram": {
    example:
      "Contoh: kartu pekerjaan banyak menumpuk di kolom review sementara development tetap menambah item baru. Cumulative Flow Diagram memperlihatkan bottleneck aliran kerja, sehingga project lead perlu membatasi WIP, memperbaiki review capacity, atau menegosiasikan prioritas sebelum menambah pekerjaan baru.",
    pmpMindset:
      "Exam tip: kalau grafik flow melebar di satu tahap, pikirkan bottleneck dan WIP limit. Jawaban terbaik biasanya memperbaiki flow, bukan menambah tekanan ke individu.",
  },
  Velocity: {
    example:
      "Contoh: tim biasanya menyelesaikan 28-32 story points per sprint, tetapi sprint terakhir hanya 18 karena ada incident production. Velocity dipakai untuk forecast realistis, bukan janji kontrak. Project manager harus menjelaskan trend dan kapasitas aktual saat membahas release plan.",
    pmpMindset:
      "Exam tip: Velocity membantu forecasting. Jangan pakai velocity untuk membandingkan dua tim atau memaksa komitmen yang tidak realistis.",
  },
  "Critical Path": {
    example:
      "Contoh: pelatihan instruktur bisa mundur dua hari tanpa mengubah launch, tetapi integrasi payment gateway tidak punya float. Critical Path menunjukkan aktivitas mana yang benar-benar menentukan tanggal selesai, sehingga schedule compression harus diarahkan ke jalur itu, bukan ke task yang terlihat ramai tetapi tidak mengubah finish date.",
    pmpMindset:
      "Exam tip: saat schedule terlambat, cari critical path dulu. Menambah resource ke aktivitas non-critical sering terlihat aktif tetapi tidak menyelesaikan masalah.",
  },
  Float: {
    example:
      "Contoh: desain sertifikat punya total float lima hari, sedangkan konfigurasi database punya float nol. Kalau resource terbatas, project manager bisa menggeser desain sertifikat tanpa mengubah tanggal selesai, tetapi tidak bisa menggeser konfigurasi database tanpa impact ke jadwal.",
    pmpMindset:
      "Exam tip: Float adalah ruang bernapas schedule. Jawaban PMP yang baik memakai float untuk trade-off, bukan menganggap semua keterlambatan sama seriusnya.",
  },
  "Change Request": {
    example:
      "Contoh: user meminta fitur export PDF setelah scope baseline disetujui. Project manager tidak otomatis bilang ya atau tidak; ia menilai impact ke scope, schedule, cost, quality, risk, lalu memasukkan permintaan ke proses change control yang disepakati.",
    pmpMindset:
      "Exam tip: perubahan setelah baseline perlu impact analysis dan jalur approval. Hindari jawaban yang langsung implement atau langsung menolak tanpa analisis.",
  },
  "Risk Register": {
    example:
      "Contoh: vendor API belum memberikan jadwal sandbox. Risk Register mencatat risk statement, probability, impact, owner, trigger, dan response sehingga tim tahu kapan harus bertindak sebelum risiko berubah menjadi issue.",
    pmpMindset:
      "Exam tip: risk adalah sesuatu yang mungkin terjadi. Kalau sudah terjadi, itu issue. Jangan campur response risk dengan firefighting issue.",
  },
  "Stakeholder Register": {
    example:
      "Contoh: sponsor mendukung project, tetapi supervisor operasional khawatir workload tim naik saat rollout. Stakeholder Register membantu project manager memetakan interest, influence, expectations, dan strategi engagement supaya resistance tidak muncul terlambat saat acceptance.",
    pmpMindset:
      "Exam tip: stakeholder yang tidak paling senior bisa tetap sangat menentukan acceptance. Jawaban terbaik sering dimulai dari memahami interest dan expectation gap.",
  },
  "Work Breakdown Structure": {
    example:
      "Contoh: deliverable 'launch learning platform' dipecah menjadi account setup, curriculum upload, payment setup, QA, onboarding, dan support handover. WBS membuat scope terlihat sebagai deliverable, bukan daftar aktivitas acak, sehingga tim bisa mengestimasi dan mengontrol scope lebih rapi.",
    pmpMindset:
      "Exam tip: WBS fokus ke deliverable dan scope completeness. Jangan mencampurnya dengan schedule sequence atau task assignment terlalu cepat.",
  },
  "Definition of Done": {
    example:
      "Contoh: sebuah lesson dianggap done hanya jika content selesai, quiz lolos review, audio bisa diputar, analytics event tercatat, dan Product Owner menerima hasilnya. Definition of Done mencegah tim menganggap pekerjaan selesai padahal masih meninggalkan rework tersembunyi.",
    pmpMindset:
      "Exam tip: DoD menjaga quality dan shared understanding. Kalau ada dispute soal 'selesai', cari agreed quality criteria sebelum menyalahkan tim.",
  },
  "Product Backlog": {
    example:
      "Contoh: permintaan user, bug, technical debt, dan enhancement dimasukkan ke Product Backlog lalu diurutkan berdasarkan value, urgency, risk, dan dependency. Project manager atau Scrum Master tidak mengambil alih prioritas bisnis; mereka membantu Product Owner menjaga transparansi dan decision flow.",
    pmpMindset:
      "Exam tip: dalam agile, prioritas backlog adalah product/value decision. Jawaban terbaik biasanya melibatkan Product Owner dan membuat trade-off transparan.",
  },
};

export function buildGlossaryExample(term: string, category?: string | null) {
  const specific = SPECIFIC_COPY[term];
  if (specific) return specific.example;

  const lower = term.toLowerCase();

  if (lower.includes("baseline")) {
    return `Contoh: ${term} dipakai sebagai titik pembanding resmi setelah rencana disetujui. Ketika realisasi mulai menyimpang, project manager membandingkan performance terhadap baseline ini, mencari penyebab variance, lalu menentukan apakah cukup corrective action atau perlu change request.`;
  }
  if (lower.includes("risk") || ["Avoid", "Mitigate", "Transfer", "Accept", "Exploit", "Enhance", "Share", "Escalate"].includes(term)) {
    return `Contoh: ${term} dipakai saat tim melihat ketidakpastian yang bisa mempengaruhi value, biaya, jadwal, atau stakeholder trust. Project manager mengubah kekhawatiran menjadi keputusan operasional: siapa owner-nya, trigger-nya apa, responsenya apa, dan kapan perlu ditinjau ulang.`;
  }
  if (lower.includes("contract") || lower.includes("procurement") || lower.includes("bidder") || lower.includes("claims")) {
    return `Contoh: ${term} muncul saat pekerjaan melibatkan seller/vendor. Project manager tidak cukup hanya mengejar delivery; ia harus membaca agreement, acceptance criteria, komunikasi formal, dan risiko claim agar hubungan procurement tetap adil dan project tetap terlindungi.`;
  }
  if (lower.includes("sprint") || lower.includes("scrum") || lower.includes("kanban") || lower.includes("backlog") || category === "Agile") {
    return `Contoh: ${term} membantu tim agile menjaga transparency, focus, dan inspect-adapt. Saat ada konflik prioritas atau pekerjaan macet, konsep ini dipakai untuk memperjelas ownership, flow, dan value sebelum memilih tindakan berikutnya.`;
  }
  if (lower.includes("stakeholder") || lower.includes("communication") || lower.includes("engagement")) {
    return `Contoh: ${term} dipakai ketika informasi yang benar perlu sampai ke orang yang tepat, dengan format dan timing yang tepat. Dalam soal PMP, masalah komunikasi jarang selesai dengan mengirim lebih banyak pesan; biasanya project manager perlu memahami kebutuhan, pengaruh, ekspektasi, dan feedback loop stakeholder.`;
  }
  if (lower.includes("quality") || lower.includes("audit") || lower.includes("inspection") || lower.includes("root cause")) {
    return `Contoh: ${term} membantu membedakan antara menemukan defect dan mencegah defect berulang. Kalau masalah kualitas muncul lagi dan lagi, project manager harus melihat process, standard, training, atau acceptance criteria, bukan hanya memperbaiki output terakhir.`;
  }
  if (lower.includes("cost") || lower.includes("earned value") || lower.includes("estimate") || lower.includes("budget") || ["CPI", "SPI", "EAC", "ETC", "BAC"].some((abbr) => term.includes(abbr))) {
    return `Contoh: ${term} dipakai untuk membaca kesehatan finansial project secara objektif. Angka bukan tujuan akhir; angka menjadi sinyal untuk memahami apakah estimasi keliru, scope berubah, productivity turun, atau risk response mulai memakan reserve.`;
  }
  if (lower.includes("leadership") || lower.includes("coaching") || lower.includes("facilitation") || lower.includes("conflict") || lower.includes("emotional")) {
    return `Contoh: ${term} dipakai saat hambatan utama bukan teknis, tetapi cara orang bekerja sama. Project manager exam-safe akan mendengar dulu, memfasilitasi dialog, memperjelas role, dan membangun psychological safety sebelum mengambil tindakan keras.`;
  }

  return `Contoh: ${term} dipakai sebagai alat berpikir untuk membaca situasi project secara lebih presisi: apakah masalahnya ada di scope, stakeholder expectation, delivery flow, risk, quality, atau governance. Dalam PMP, nilai utamanya adalah membantu project manager memilih tindakan yang tepat, bukan sekadar mengenali istilah.`;
}

export function buildGlossaryPmpMindset(term: string, category?: string | null) {
  const specific = SPECIFIC_COPY[term];
  if (specific) return specific.pmpMindset;

  const lower = term.toLowerCase();

  if (lower.includes("baseline")) {
    return "Exam tip: baseline adalah komitmen terkontrol. Kalau ada deviasi, analisis variance dan impact dulu; jangan ubah baseline tanpa approved change.";
  }
  if (lower.includes("risk") || ["Avoid", "Mitigate", "Transfer", "Accept", "Exploit", "Enhance", "Share", "Escalate"].includes(term)) {
    return "Exam tip: untuk risk, cari owner, trigger, response, dan timing. Jangan escalate hanya karena risiko terdengar besar kalau masih bisa dianalisis dan dikelola dalam project.";
  }
  if (lower.includes("contract") || lower.includes("procurement") || lower.includes("bidder") || lower.includes("claims")) {
    return "Exam tip: vendor problem dibaca lewat contract dan procurement documents dulu. Jawaban emosional seperti langsung menghukum seller sering jadi trap.";
  }
  if (lower.includes("sprint") || lower.includes("scrum") || lower.includes("kanban") || lower.includes("backlog") || category === "Agile") {
    return "Exam tip: agile answer yang kuat menjaga transparency, servant leadership, Product Owner authority, dan team self-management.";
  }
  if (lower.includes("stakeholder") || lower.includes("communication") || lower.includes("engagement")) {
    return "Exam tip: sebelum mengubah pesan, pahami stakeholder need. PMP sering menguji expectation management, bukan sekadar broadcast informasi.";
  }
  if (lower.includes("quality") || lower.includes("audit") || lower.includes("inspection") || lower.includes("root cause")) {
    return "Exam tip: recurring defect butuh root cause dan process improvement. Quick fix saja biasanya belum cukup.";
  }
  if (lower.includes("cost") || lower.includes("earned value") || lower.includes("estimate") || lower.includes("budget") || ["CPI", "SPI", "EAC", "ETC", "BAC"].some((abbr) => term.includes(abbr))) {
    return "Exam tip: EVM dan cost term adalah diagnosis tool. Baca trend dan forecast sebelum memilih corrective action.";
  }
  if (lower.includes("leadership") || lower.includes("coaching") || lower.includes("facilitation") || lower.includes("conflict") || lower.includes("emotional")) {
    return "Exam tip: people issue jarang dijawab dengan command-and-control. Cari opsi yang memfasilitasi, melatih, dan memperjelas masalah bersama tim.";
  }

  return "Exam tip: tanyakan fungsi istilah ini di skenario: context, artifact, analysis tool, decision gate, atau stakeholder signal. Jawaban terbaik biasanya mengikuti fungsi itu.";
}
