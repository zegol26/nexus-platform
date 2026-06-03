export function isCertificateEligibleForProgress({
  role,
  percentage,
}: {
  role?: string | null;
  percentage: number;
}) {
  return role === "ADMIN" || role === "SUPER_ADMIN" || percentage >= 100;
}

export const certificatePrograms = {
  nihongo: {
    appCode: "JP",
    courseName: "Japanese for JLPT N5/N4 Preparation",
  },
  english: {
    appCode: "EN",
    courseName: "English Interview Preparation",
  },
  arabic: {
    appCode: "AR",
    courseName: "Arabic Daily Conversation",
  },
  pmp: {
    appCode: "PMP",
    courseName: "PMP Exam Preparation",
  },
} as const;

export type CertificateAppSlug = keyof typeof certificatePrograms;

export function getCertificateProgram(appSlug: string) {
  return certificatePrograms[appSlug as CertificateAppSlug] ?? null;
}
