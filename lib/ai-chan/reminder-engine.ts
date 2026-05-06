export type AiChanReminderType =
  | "payment"
  | "trial"
  | "study"
  | "inactive"
  | "custom"
  | "default";

export type AiChanReminderPriority = "high" | "medium" | "low" | "default";

export type AiChanReminderCta = {
  label: string;
  href: string;
};

export type AiChanReminder = {
  id: string;
  type: AiChanReminderType;
  priority: AiChanReminderPriority;
  title: string;
  message: string;
  cta?: AiChanReminderCta;
};

export type AiChanUserContext = {
  name?: string | null;
  email?: string | null;
};

export type AiChanSubscriptionContext = {
  status?: "TRIAL" | "ACTIVE" | "EXPIRED" | "CANCELED" | string | null;
  expiresAt?: string | Date | null;
  hasUnpaidPayment?: boolean;
};

export type AiChanTrialContext = {
  isTrial?: boolean;
  usageCount?: number;
  quota?: number;
};

export type AiChanLessonContext = {
  id: string;
  title: string;
  href: string;
};

export type AiChanReminderContext = {
  user?: AiChanUserContext;
  subscription?: AiChanSubscriptionContext | null;
  trial?: AiChanTrialContext | null;
  nextLesson?: AiChanLessonContext | null;
  lastActiveAt?: string | Date | null;
  customReminders?: AiChanReminder[];
};

const DAY_MS = 1000 * 60 * 60 * 24;
const PAYMENT_RENEWAL_WINDOW_DAYS = 7;
const TRIAL_USAGE_THRESHOLD = 0.8;
const INACTIVE_DAYS_THRESHOLD = 3;

function getDisplayName(user?: AiChanUserContext) {
  return user?.name?.trim() || user?.email?.split("@")[0] || "teman Nexus";
}

function toDate(value?: string | Date | null) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getDaysUntil(value?: string | Date | null) {
  const date = toDate(value);
  if (!date) return null;

  return Math.ceil((date.getTime() - Date.now()) / DAY_MS);
}

function getInactiveDays(value?: string | Date | null) {
  const date = toDate(value);
  if (!date) return null;

  return Math.floor((Date.now() - date.getTime()) / DAY_MS);
}

function buildDefaultGreeting(user?: AiChanUserContext): AiChanReminder {
  const name = getDisplayName(user);

  return {
    id: "default-greeting",
    type: "default",
    priority: "default",
    title: `Hai, ${name}!`,
    message:
      "Ai-chan siap menemani belajarmu hari ini. Yuk lanjutkan langkah kecil yang konsisten.",
  };
}

export function generateAiChanReminders(
  context: AiChanReminderContext
): AiChanReminder[] {
  const reminders: AiChanReminder[] = [];
  const subscription = context.subscription;
  const renewalDaysLeft = getDaysUntil(subscription?.expiresAt);
  const hasUpcomingRenewal =
    typeof renewalDaysLeft === "number" &&
    renewalDaysLeft >= 0 &&
    renewalDaysLeft <= PAYMENT_RENEWAL_WINDOW_DAYS;
  const hasPaymentReminder =
    subscription?.hasUnpaidPayment ||
    subscription?.status === "EXPIRED" ||
    hasUpcomingRenewal;

  if (hasPaymentReminder) {
    reminders.push({
      id: "payment-reminder",
      type: "payment",
      priority: "high",
      title: "Pengingat langganan",
      message:
        subscription?.status === "EXPIRED"
          ? "Pengingat ramah dari Ai-chan: akses belajarmu perlu diperpanjang agar progres tetap lancar."
          : "Sekadar mengingatkan: langgananmu akan diperpanjang sebentar lagi. Kamu bisa mengatur pembayaran kapan saja.",
      cta: {
        label: "Kelola Billing",
        href: "/platform/billing",
      },
    });
  }

  const usageCount = context.trial?.usageCount ?? 0;
  const quota = context.trial?.quota ?? 0;
  const trialUsageRatio = quota > 0 ? usageCount / quota : 0;

  if (context.trial?.isTrial && trialUsageRatio >= TRIAL_USAGE_THRESHOLD) {
    reminders.push({
      id: "trial-reminder",
      type: "trial",
      priority: "high",
      title: "Trial hampir penuh",
      message:
        "Kamu sudah dekat dengan batas trial. Buka akses penuh kapan saja supaya belajar tetap bebas.",
      cta: {
        label: "Lihat Paket",
        href: "/platform/billing",
      },
    });
  }

  if (context.nextLesson) {
    reminders.push({
      id: `study-${context.nextLesson.id}`,
      type: "study",
      priority: "medium",
      title: "Pelajaran berikutnya",
      message: `Materi berikutnya sudah menunggu: ${context.nextLesson.title}.`,
      cta: {
        label: "Lanjut Belajar",
        href: context.nextLesson.href,
      },
    });
  }

  const inactiveDays = getInactiveDays(context.lastActiveAt);

  if (
    typeof inactiveDays === "number" &&
    inactiveDays > INACTIVE_DAYS_THRESHOLD
  ) {
    reminders.push({
      id: "inactive-reminder",
      type: "inactive",
      priority: "low",
      title: "Rindu progresmu",
      message:
        "Sudah beberapa hari kamu belum lanjut belajar. Siap menyalakan lagi ritme progresmu?",
      cta: {
        label: "Buka Dashboard",
        href: "/platform/dashboard",
      },
    });
  }

  if (context.customReminders?.length) {
    reminders.push(...context.customReminders);
  }

  reminders.push(buildDefaultGreeting(context.user));

  return reminders;
}

export function getPrimaryAiChanReminder(
  context: AiChanReminderContext
): AiChanReminder {
  return generateAiChanReminders(context)[0] ?? buildDefaultGreeting(context.user);
}
