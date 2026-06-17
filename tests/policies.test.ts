import assert from "node:assert/strict";
import { groupRecordings } from "../lib/admin/recordings";
import {
  TRIAL_AI_TUTOR_LIMIT,
  TRIAL_FLASHCARD_LIMIT,
  TRIAL_LESSON_LIMIT,
  decideAiTutorAccess,
  decideFlashcardAccess,
  decideLessonAccess,
  decideReadingAccess,
} from "../lib/nexus/access-policy";
import { normalizeRequestedVariant, selectLessonTemplateVariant } from "../lib/nihongo/lesson-cache-policy";
import {
  getMidtransBaseUrl,
  getMidtransMode,
  getMidtransRuntimeMode,
  isMidtransCheckoutOpen,
  mapMidtransStatus,
  resolveMidtransCheckoutMode,
} from "../lib/platform/midtrans";
import { canActOnPayment, normalizePaymentVerificationAction } from "../lib/platform/payment-policy";
import { isCertificateEligibleForProgress } from "../lib/certificates/policy";
import {
  durationDaysForBillingPeriod,
  priceCentsToRupiah,
  rupiahToPriceCents,
} from "../lib/platform/pricing-policy";
import {
  mapBillingSettings,
  normalizePlatformSettingsPatch,
  platformSettingKeys,
} from "../lib/platform/settings-policy";

const tests: Array<{ name: string; run: () => void }> = [];

function test(name: string, run: () => void) {
  tests.push({ name, run });
}

test("trial lesson access allows only the first five lessons", () => {
  assert.deepEqual(decideLessonAccess({ isPaid: false, plan: "TRIAL", lessonOrder: TRIAL_LESSON_LIMIT }), {
    allowed: true,
    plan: "TRIAL",
    limit: TRIAL_LESSON_LIMIT,
    reason: undefined,
  });

  assert.deepEqual(decideLessonAccess({ isPaid: false, plan: "TRIAL", lessonOrder: TRIAL_LESSON_LIMIT + 1 }), {
    allowed: false,
    plan: "TRIAL",
    limit: TRIAL_LESSON_LIMIT,
    reason: `Trial access is limited to lesson ${TRIAL_LESSON_LIMIT}.`,
  });

  assert.deepEqual(decideLessonAccess({ isPaid: true, plan: "PRO", lessonOrder: 99 }), {
    allowed: true,
    plan: "PRO",
  });
});

test("trial feature limits are deterministic and paid users bypass limits", () => {
  assert.deepEqual(decideFlashcardAccess({ isPaid: false, plan: "TRIAL", requestedLimit: 50 }), {
    allowed: true,
    plan: "TRIAL",
    limit: TRIAL_FLASHCARD_LIMIT,
    used: TRIAL_FLASHCARD_LIMIT,
  });

  assert.deepEqual(decideAiTutorAccess({ isPaid: false, plan: "TRIAL", used: TRIAL_AI_TUTOR_LIMIT }), {
    allowed: false,
    plan: "TRIAL",
    limit: TRIAL_AI_TUTOR_LIMIT,
    used: TRIAL_AI_TUTOR_LIMIT,
    reason: "Trial AI Tutor limit reached.",
  });

  assert.deepEqual(decideReadingAccess({ isTrial: true, plan: "TRIAL" }), {
    allowed: true,
    plan: "TRIAL",
    reason: "Trial reading uses cached passages only.",
  });

  assert.deepEqual(decideAiTutorAccess({ isPaid: true, plan: "PRO", used: 999 }), {
    allowed: true,
    plan: "PRO",
  });
});

test("lesson cache normalizes requested variants and fills missing cache slots", () => {
  assert.equal(normalizeRequestedVariant(1), 1);
  assert.equal(normalizeRequestedVariant(4), 1);
  assert.equal(normalizeRequestedVariant(5), 2);
  assert.equal(normalizeRequestedVariant("bad"), 1);

  assert.equal(selectLessonTemplateVariant({ cachedVariants: [], requestedVariant: 2 }), 2);
  assert.equal(selectLessonTemplateVariant({ cachedVariants: [2], requestedVariant: 2 }), 1);
  assert.equal(selectLessonTemplateVariant({ cachedVariants: [1, 2], requestedVariant: 2 }), 3);
  assert.equal(selectLessonTemplateVariant({ cachedVariants: [1, 2, 3], requestedVariant: 2 }), 2);
});

test("billing settings are mapped from database records with empty fallbacks", () => {
  assert.deepEqual(
    mapBillingSettings([
      { key: platformSettingKeys.lessonPriceCents, value: "150000" },
      { key: platformSettingKeys.qrisInfo, value: "QRIS account" },
    ]),
    {
      lessonPriceCents: "150000",
      qrisInfo: "QRIS account",
      bankInfo: "",
      midtransMode: "sandbox",
      midtransEnabled: "false",
      promoCampaigns: "",
    },
  );
});

test("admin billing settings patch accepts UI aliases and database keys", () => {
  assert.deepEqual(
    normalizePlatformSettingsPatch({
      midtransMode: "production",
      midtransEnabled: "true",
      ignored: "nope",
    }),
    {
      [platformSettingKeys.midtransMode]: "production",
      [platformSettingKeys.midtransEnabled]: "true",
    },
  );

  assert.deepEqual(
    normalizePlatformSettingsPatch({
      [platformSettingKeys.midtransMode]: "sandbox",
      [platformSettingKeys.midtransEnabled]: "false",
    }),
    {
      [platformSettingKeys.midtransMode]: "sandbox",
      [platformSettingKeys.midtransEnabled]: "false",
    },
  );
});

test("midtrans mode policy separates sandbox and production payment flows", () => {
  assert.equal(getMidtransMode("production"), "production");
  assert.equal(getMidtransMode("sandbox"), "sandbox");
  assert.equal(getMidtransMode("anything"), "sandbox");
  assert.equal(getMidtransBaseUrl("production"), "https://app.midtrans.com");
  assert.equal(getMidtransBaseUrl("sandbox"), "https://app.sandbox.midtrans.com");
  assert.equal(mapMidtransStatus("settlement"), "PAID");
  assert.equal(mapMidtransStatus("capture", "challenge"), "WAITING_VERIFICATION");
  assert.equal(mapMidtransStatus("pending"), "PENDING");
  assert.notEqual(mapMidtransStatus("failure"), "PAID");
  assert.notEqual(mapMidtransStatus("refund"), "PAID");
  assert.notEqual(mapMidtransStatus("chargeback"), "PAID");
});

test("production payment runtime is always open while sandbox remains toggleable", () => {
  const originalVercelEnv = process.env.VERCEL_ENV;

  process.env.VERCEL_ENV = "production";
  assert.equal(getMidtransRuntimeMode("sandbox"), "production");
  assert.equal(isMidtransCheckoutOpen("production", "false"), true);
  assert.equal(resolveMidtransCheckoutMode("production", "false"), "production");
  assert.equal(resolveMidtransCheckoutMode("sandbox", "true"), "sandbox");
  assert.equal(resolveMidtransCheckoutMode("sandbox", "false"), null);

  process.env.VERCEL_ENV = "preview";
  assert.equal(getMidtransRuntimeMode("production"), "sandbox");
  assert.equal(getMidtransRuntimeMode("sandbox"), "sandbox");
  assert.equal(isMidtransCheckoutOpen("sandbox", "false"), false);
  assert.equal(isMidtransCheckoutOpen("sandbox", "true"), true);
  assert.equal(resolveMidtransCheckoutMode("production", "true"), "sandbox");
  assert.equal(resolveMidtransCheckoutMode("sandbox", "true"), "sandbox");

  if (originalVercelEnv === undefined) {
    delete process.env.VERCEL_ENV;
  } else {
    process.env.VERCEL_ENV = originalVercelEnv;
  }
});

test("pricing policy stores rupiah as cents and locks fixed billing periods to the right duration", () => {
  assert.equal(rupiahToPriceCents("120000"), 12000000);
  assert.equal(priceCentsToRupiah(25000000), 250000);
  assert.equal(durationDaysForBillingPeriod("MONTHLY", 1), 30);
  assert.equal(durationDaysForBillingPeriod("QUARTERLY", 30), 90);
  assert.equal(durationDaysForBillingPeriod("YEARLY", 30), 365);
  assert.equal(durationDaysForBillingPeriod("CUSTOM", 45), 45);
});

test("manual payment policy disables actions for rejected payments", () => {
  assert.equal(normalizePaymentVerificationAction("REJECTED"), "REJECTED");
  assert.equal(normalizePaymentVerificationAction("PAID"), "PAID");
  assert.equal(normalizePaymentVerificationAction("anything-else"), "PAID");
  assert.equal(canActOnPayment("WAITING_VERIFICATION"), true);
  assert.equal(canActOnPayment("REJECTED"), false);
});

test("certificate policy lets admins obtain certificates without 100 percent progress", () => {
  assert.equal(isCertificateEligibleForProgress({ role: "ADMIN", percentage: 0 }), true);
  assert.equal(isCertificateEligibleForProgress({ role: "SUPER_ADMIN", percentage: 25 }), true);
  assert.equal(isCertificateEligibleForProgress({ role: "USER", percentage: 99 }), false);
  assert.equal(isCertificateEligibleForProgress({ role: "USER", percentage: 100 }), true);
});

test("admin recordings are grouped by user and question with newest recording first", () => {
  const oldDate = new Date("2026-05-01T10:00:00.000Z");
  const newDate = new Date("2026-05-02T10:00:00.000Z");
  const grouped = groupRecordings([
    {
      id: "old",
      userId: "user-1",
      questionId: "q-2",
      submittedAt: oldDate,
      user: { name: "Ayu", email: "ayu@nexus.test" },
      question: { order: 2, prompt: "Q2", focusArea: "Confidence" },
    },
    {
      id: "new",
      userId: "user-1",
      questionId: "q-2",
      submittedAt: newDate,
      user: { name: "Ayu", email: "ayu@nexus.test" },
      question: { order: 2, prompt: "Q2", focusArea: "Confidence" },
    },
    {
      id: "first-question",
      userId: "user-1",
      questionId: "q-1",
      submittedAt: oldDate,
      user: { name: "Ayu", email: "ayu@nexus.test" },
      question: { order: 1, prompt: "Q1", focusArea: "Fluency" },
    },
  ]);

  assert.equal(grouped.length, 1);
  assert.equal(grouped[0].label, "Ayu");
  assert.equal(grouped[0].total, 3);
  assert.deepEqual(grouped[0].questions.map((question) => question.questionId), ["q-1", "q-2"]);
  assert.deepEqual(grouped[0].questions[1].recordings.map((recording) => recording.id), ["new", "old"]);
});

let failed = 0;

for (const item of tests) {
  try {
    item.run();
    console.log(`ok - ${item.name}`);
  } catch (error) {
    failed += 1;
    console.error(`not ok - ${item.name}`);
    console.error(error);
  }
}

if (failed > 0) {
  process.exitCode = 1;
} else {
  console.log(`${tests.length} tests passed`);
}
