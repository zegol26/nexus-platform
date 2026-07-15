import "dotenv/config";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { prisma } from "../lib/db/prisma";
import { importStoryArcContentPackage } from "../lib/storyarc/content/importer";

const directory = path.join(process.cwd(), "prisma", "data", "storyarc");
const files = readdirSync(directory).filter((file) => file.endsWith(".json")).sort();

async function main() {
  const reports = [];
  try {
    for (const file of files) {
      const contentPackage = JSON.parse(readFileSync(path.join(directory, file), "utf8")) as unknown;
      const report = await importStoryArcContentPackage(contentPackage, {
        dryRun: false,
        actorId: "codex-storyarc-release-repair-20260714",
      });
      reports.push({
        file,
        ok: report.ok,
        creates: report.creates,
        unchanged: report.unchanged,
        conflicts: report.conflicts,
      });
      if (!report.ok) throw new Error(`StoryArc import failed for ${file}`);
    }

    const canonicalAfter = {
      items: await prisma.storyArcContentItem.count(),
      revisions: await prisma.storyArcContentRevision.count(),
      draft: await prisma.storyArcContentRevision.count({ where: { state: "DRAFT" } }),
      published: await prisma.storyArcContentRevision.count({ where: { state: "PUBLISHED" } }),
    };
    console.log(JSON.stringify({ reports, canonicalAfter }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

void main();
