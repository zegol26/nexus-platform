import type { UserRole } from "@prisma/client";

export const JLPT_N5_MOCK_READY_THRESHOLD = 70;

export type NihongoMockReadiness = {
  isAdmin: boolean;
  isReady: boolean;
  readinessScore: number;
  threshold: number;
  message: string;
};

export function calculateN5MockReadiness(params: {
  role?: UserRole | string | null;
  latestAssessmentScore?: number | null;
  profileLevel?: string | null;
}): NihongoMockReadiness {
  const isAdmin = params.role === "ADMIN" || params.role === "SUPER_ADMIN";
  const readinessScore = Math.max(0, Math.min(100, params.latestAssessmentScore ?? 0));
  const isReady = isAdmin || readinessScore >= JLPT_N5_MOCK_READY_THRESHOLD;

  return {
    isAdmin,
    isReady,
    readinessScore,
    threshold: JLPT_N5_MOCK_READY_THRESHOLD,
    message: isReady
      ? `Kamu sudah ready ${readinessScore}% untuk mencoba JLPT N5 Mock Test. Ini waktunya latihan seperti ujian sungguhan.`
      : `JLPT N5 Mock Test akan terbuka saat readiness kamu mencapai ${JLPT_N5_MOCK_READY_THRESHOLD}%. Saat ini ${readinessScore}%.`,
  };
}
