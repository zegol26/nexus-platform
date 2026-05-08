import type { UserRole } from "@prisma/client";

export const JLPT_N5_MOCK_READY_THRESHOLD = 70;
export const JLPT_N4_MOCK_READY_THRESHOLD = 70;

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
  return calculateMockReadiness({
    ...params,
    level: "N5",
    threshold: JLPT_N5_MOCK_READY_THRESHOLD,
  });
}

export function calculateN4MockReadiness(params: {
  role?: UserRole | string | null;
  latestAssessmentScore?: number | null;
  profileLevel?: string | null;
}): NihongoMockReadiness {
  return calculateMockReadiness({
    ...params,
    level: "N4",
    threshold: JLPT_N4_MOCK_READY_THRESHOLD,
  });
}

function calculateMockReadiness(params: {
  role?: UserRole | string | null;
  latestAssessmentScore?: number | null;
  profileLevel?: string | null;
  level: "N5" | "N4";
  threshold: number;
}): NihongoMockReadiness {
  const isAdmin = params.role === "ADMIN" || params.role === "SUPER_ADMIN";
  const readinessScore = Math.max(0, Math.min(100, params.latestAssessmentScore ?? 0));
  const isReady = isAdmin || readinessScore >= params.threshold;

  return {
    isAdmin,
    isReady,
    readinessScore,
    threshold: params.threshold,
    message: isReady
      ? `Kamu sudah ready ${readinessScore}% untuk mencoba JLPT ${params.level} Mock Test. Ini waktunya latihan seperti ujian sungguhan.`
      : `JLPT ${params.level} Mock Test akan terbuka saat readiness kamu mencapai ${params.threshold}%. Saat ini ${readinessScore}%.`,
  };
}
