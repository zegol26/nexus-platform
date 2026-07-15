import { STORYARC_FOUNDATION_PACKAGE } from "../lib/storyarc/content/foundation-fixture";
import { importStoryArcContentPackage } from "../lib/storyarc/content/importer";
import { prisma } from "./seed-client";

export async function seedStoryArcFoundation() {
  const admin = await prisma.user.findFirst({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!admin) throw new Error("StoryArc foundation seed requires an existing admin user.");

  const result = await importStoryArcContentPackage(
    STORYARC_FOUNDATION_PACKAGE,
    { dryRun: false, actorId: admin.id },
    prisma,
  );
  if (!result.ok) throw new Error(`StoryArc foundation import failed: ${JSON.stringify(result)}`);

  const revision = await prisma.storyArcContentRevision.findFirst({
    where: { item: { stableId: "sm-g10-01" }, revision: 1 },
  });
  if (!revision) throw new Error("StoryArc foundation revision was not created.");
  if (revision.state !== "PUBLISHED") {
    await prisma.storyArcContentRevision.update({
      where: { id: revision.id },
      data: {
        state: "PUBLISHED",
        reviewedById: admin.id,
        approvedById: admin.id,
        reviewedAt: new Date(),
        approvedAt: new Date(),
        publishedAt: new Date(),
      },
    });
  }

  console.log("StoryArc Phase A foundation seeded: sm-g10-01@1");
}
