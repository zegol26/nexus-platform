const kaScenarios: Record<string, string[]> = {
  Integration: ["charter belum jelas", "change request saling bertabrakan", "lessons learned tidak dipakai", "sponsor meminta pivot strategy"],
  Scope: ["user meminta fitur tambahan", "requirements ambigu", "WBS belum disepakati", "accepted deliverable diperdebatkan"],
  Schedule: ["critical path bergeser", "vendor terlambat", "estimasi durasi terlalu optimistis", "milestone compliance mendekat"],
  Cost: ["forecast melewati budget", "reserve dipakai tanpa alasan jelas", "estimasi vendor berubah", "CPI turun dua periode"],
  Quality: ["defect berulang", "acceptance criteria kabur", "audit menemukan gap proses", "testing dilakukan terlalu akhir"],
  Resource: ["team conflict meningkat", "resource key person unavailable", "virtual team miskomunikasi", "skill gap menghambat delivery"],
  Communications: ["stakeholder salah memahami status", "report terlalu teknis", "feedback penting tidak sampai", "channel komunikasi tidak efektif"],
  Risk: ["risk trigger muncul", "risk owner pasif", "secondary risk muncul", "risk response tidak dijalankan"],
  Procurement: ["seller melewati SLA", "proposal sulit dibandingkan", "contract term ambigu", "claim mulai muncul"],
  Stakeholder: ["stakeholder resisten", "power-interest berubah", "user tidak hadir review", "sponsor dan operation berbeda prioritas"],
};

export function getKnowledgeAreaPracticeQuestions(knowledgeArea: string) {
  const scenarios = kaScenarios[knowledgeArea] ?? kaScenarios.Integration;
  return Array.from({ length: 20 }, (_, index) => {
    const scenario = scenarios[index % scenarios.length];
    const number = index + 1;
    return {
      id: `${knowledgeArea.toUpperCase()}-${String(number).padStart(2, "0")}`,
      prompt:
        `Dalam proyek transformasi Nexus, area ${knowledgeArea} menghadapi situasi: ${scenario}. Tim meminta keputusan cepat, tetapi informasi dampak belum lengkap. Apa yang sebaiknya project manager lakukan NEXT?`,
      options: {
        A: "Mengklarifikasi fakta, melibatkan stakeholder relevan, dan menilai dampak sebelum memilih tindakan.",
        B: "Mengambil tindakan tercepat agar tim merasa ada keputusan dan pekerjaan tidak berhenti.",
        C: "Langsung meminta sponsor menentukan keputusan karena situasinya terlihat penting.",
        D: "Mengikuti rencana awal tanpa perubahan karena baseline harus dilindungi.",
      },
      correctAnswer: "A",
      explanation:
        `Untuk ${knowledgeArea}, PMIism menekankan analisis, kolaborasi, transparency, dan value-driven decision. Jawaban terbaik tidak reaktif, tidak escalate terlalu awal, dan tidak kaku terhadap fakta baru.`,
    };
  });
}
