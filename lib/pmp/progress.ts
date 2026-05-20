import { PMP_NEXUS_COURSE } from "./course";

export type ProgressStatus = "not_started" | "in_progress" | "completed";

export type LessonProgressView = {
  lessonId: string;
  status: ProgressStatus;
  completedAt: string | null;
  lastAccessedAt: string;
};

export type ProgressSnapshot = {
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  percentComplete: number;
  readinessCompleted: number;
  readinessTotal: number;
  readinessPercent: number;
  overallPercent: number;
};

export const READINESS_CHECKLIST: ReadonlyArray<{
  key: string;
  title: string;
  description: string;
  group: "Prep" | "Knowledge" | "Practice" | "Exam Day";
}> = [
  {
    key: "review-eco",
    title: "Baca ECO outline (mindset, domain weighting)",
    description: "Pahami People 42 / Process 50 / Business 8 (current) atau 33/41/26 (2026 readiness).",
    group: "Prep",
  },
  {
    key: "course-complete-all",
    title: "Selesaikan semua lesson di Course",
    description: "Tandai setiap lesson selesai setelah membaca + drill.",
    group: "Knowledge",
  },
  {
    key: "kb-procurement",
    title: "Baca KB Procurement (RFI/RFQ/RFP, contract types)",
    description: "Termasuk FFP, FPIF, FPEPA, T&M, CPFF, CPIF, CPAF.",
    group: "Knowledge",
  },
  {
    key: "kb-quality",
    title: "Baca KB Quality (Pareto, fishbone, control chart)",
    description: "Quality vs grade, COQ, rule of seven.",
    group: "Knowledge",
  },
  {
    key: "kb-risk",
    title: "Baca KB Risk (5+5 strategies, EMV)",
    description: "Threat strategies + opportunity strategies + decision tree.",
    group: "Knowledge",
  },
  {
    key: "kb-evm",
    title: "Hafal EVM math (CV, SV, CPI, SPI, EAC)",
    description: "Latih 5× worked example sampai reflex.",
    group: "Knowledge",
  },
  {
    key: "kb-motivation-conflict",
    title: "Hafal motivation + conflict theories",
    description: "Maslow, Herzberg, McGregor, McClelland, Thomas-Kilmann, Tuckman.",
    group: "Knowledge",
  },
  {
    key: "drill-60q",
    title: "Selesaikan 60Q timed block ≥ 70%",
    description: "Pace ~76 detik/soal. Flag yang ragu.",
    group: "Practice",
  },
  {
    key: "drill-180q",
    title: "Full 180Q simulation ≥ 70%",
    description: "Endurance test 4 jam. Setelahnya wajib diagnostic.",
    group: "Practice",
  },
  {
    key: "trap-log",
    title: "Buat trap log dari wrong answers",
    description: "Label tiap salah jawab dengan trap type (escalation/firefighter/agile-command/scope-rigidity).",
    group: "Practice",
  },
  {
    key: "brain-dump-prep",
    title: "Latih brain dump (EVM, KA, process group)",
    description: "Latih menulis rumus + nama process kunci dalam 5 menit pertama exam.",
    group: "Exam Day",
  },
  {
    key: "exam-scheduled",
    title: "Jadwal exam di PMI / Pearson VUE",
    description: "Konfirmasi tanggal, lokasi/online, persyaratan ID.",
    group: "Exam Day",
  },
];

export function computeProgressSnapshot(input: {
  completedLessonIds: string[];
  inProgressLessonIds: string[];
  readinessCompletedKeys: string[];
}): ProgressSnapshot {
  const totalLessons = PMP_NEXUS_COURSE.length;
  const completedLessons = input.completedLessonIds.length;
  const inProgressLessons = input.inProgressLessonIds.length;
  const percentComplete =
    totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  const readinessTotal = READINESS_CHECKLIST.length;
  const readinessCompleted = input.readinessCompletedKeys.length;
  const readinessPercent =
    readinessTotal === 0 ? 0 : Math.round((readinessCompleted / readinessTotal) * 100);

  // Overall: lessons weighted 0.6, readiness 0.4.
  const overallPercent = Math.round(percentComplete * 0.6 + readinessPercent * 0.4);

  return {
    totalLessons,
    completedLessons,
    inProgressLessons,
    percentComplete,
    readinessCompleted,
    readinessTotal,
    readinessPercent,
    overallPercent,
  };
}
