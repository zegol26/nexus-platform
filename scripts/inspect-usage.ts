import "dotenv/config";
import { prisma } from "@/lib/db/prisma";

async function main() {
  const usage = await prisma.featureUsage.findMany({
    include: { user: { select: { email: true, role: true } } },
    orderBy: { updatedAt: "desc" },
    take: 30,
  });

  console.log(`FeatureUsage rows: ${usage.length}`);
  for (const row of usage) {
    console.log(
      `  ${row.feature.padEnd(28)} count=${row.count} user=${row.user.email} (${row.user.role}) period=${row.periodStart.toISOString().slice(0, 10)}`
    );
  }

  const tutorEvents = await prisma.analyticsEvent.count({
    where: { eventType: "AI_TUTOR_MESSAGE" },
  });
  console.log(`\nAnalyticsEvent AI_TUTOR_MESSAGE rows: ${tutorEvents}`);

  const recent = await prisma.analyticsEvent.findMany({
    where: { eventType: "AI_TUTOR_MESSAGE" },
    select: { metadata: true, userId: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  console.log("\nRecent tutor turns:");
  for (const e of recent) {
    const meta = e.metadata as Record<string, unknown> | null;
    const userMsg = String(meta?.userMessage ?? "").slice(0, 60);
    const reply = String(meta?.assistantReply ?? "").slice(0, 60);
    const mode = String(meta?.mode ?? "?");
    console.log(`  [${mode}] q="${userMsg}" → r="${reply}"`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
