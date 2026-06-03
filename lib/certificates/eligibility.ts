import { prisma } from "@/lib/db/prisma";
import { arabicCurriculum } from "@/lib/arabic/curriculum";
import { computeProgressSnapshot } from "@/lib/pmp/progress";
import { isCertificateEligibleForProgress } from "@/lib/certificates/policy";

type CertificateUser = {
  id: string;
  role?: string | null;
};

function percent(completed: number, total: number) {
  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

export async function getCourseCompletionPercentage(userId: string, appSlug: string) {
  if (appSlug === "nihongo") {
    const [totalLessons, completedLessons] = await Promise.all([
      prisma.nihongoLesson.count(),
      prisma.nihongoLessonProgress.count({
        where: { userId, completed: true },
      }),
    ]);

    return {
      percentage: percent(completedLessons, totalLessons),
      completedLessons,
      totalLessons,
    };
  }

  if (appSlug === "arabic") {
    const completedEvents = await prisma.analyticsEvent.findMany({
      where: {
        userId,
        appSlug: "arabic",
        eventType: "LESSON_COMPLETED",
      },
      select: { lessonId: true },
    });
    const completedLessonIds = new Set(
      completedEvents.map((event) => event.lessonId).filter(Boolean) as string[]
    );

    return {
      percentage: percent(completedLessonIds.size, arabicCurriculum.length),
      completedLessons: completedLessonIds.size,
      totalLessons: arabicCurriculum.length,
    };
  }

  if (appSlug === "pmp") {
    const lessons = await prisma.pmpLessonProgress.findMany({
      where: { userId },
      select: { lessonId: true, status: true },
    });
    const snapshot = computeProgressSnapshot({
      completedLessonIds: lessons
        .filter((lesson) => lesson.status === "completed")
        .map((lesson) => lesson.lessonId),
      inProgressLessonIds: lessons
        .filter((lesson) => lesson.status === "in_progress")
        .map((lesson) => lesson.lessonId),
      readinessCompletedKeys: [],
    });

    return {
      percentage: snapshot.percentComplete,
      completedLessons: snapshot.completedLessons,
      totalLessons: snapshot.totalLessons,
    };
  }

  return {
    percentage: 0,
    completedLessons: 0,
    totalLessons: 0,
  };
}

export async function getCertificateEligibility(user: CertificateUser, appSlug: string) {
  const completion = await getCourseCompletionPercentage(user.id, appSlug);
  const adminOverride = isCertificateEligibleForProgress({
    role: user.role,
    percentage: -1,
  });
  const eligible = isCertificateEligibleForProgress({
    role: user.role,
    percentage: completion.percentage,
  });

  return {
    ...completion,
    eligible,
    adminOverride,
    reason: eligible
      ? adminOverride
        ? "Admin users are eligible to generate academy certificates."
        : "Course completion reached 100%."
      : "Selesaikan 100% course untuk membuka diploma certificate.",
  };
}
