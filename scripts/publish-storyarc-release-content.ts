import "dotenv/config";
import { prisma } from "../lib/db/prisma";
import { publishStoryArcCanonicalRelease } from "../lib/storyarc/content/release";

async function main() {
  try {
    const admin = await prisma.user.findFirst({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      select: { id: true, email: true },
      orderBy: { createdAt: "asc" },
    });
    if (!admin) {
      throw new Error("An admin user is required to approve the StoryArc release.");
    }

    const result = await publishStoryArcCanonicalRelease(admin.id);
    console.log(JSON.stringify({
      published: result.catalog.published,
      expected: result.catalog.expected,
      byTrack: result.catalog.byTrack,
      byGrade: result.catalog.byGrade,
      approvedBy: admin.email,
    }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

void main();
