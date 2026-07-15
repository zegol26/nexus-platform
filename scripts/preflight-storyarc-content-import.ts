import "dotenv/config";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { prisma } from "../lib/db/prisma";
import { importStoryArcContentPackage } from "../lib/storyarc/content/importer";

const directory = path.join(process.cwd(), "prisma", "data", "storyarc");
const files = readdirSync(directory).filter((file) => file.endsWith(".json")).sort();

async function main() {
  try {
    const canonicalBefore = {
      items: await prisma.storyArcContentItem.count(),
      revisions: await prisma.storyArcContentRevision.count(),
      published: await prisma.storyArcContentRevision.count({ where: { state: "PUBLISHED" } }),
    };
    const reports = [];
    for (const file of files) {
      const input = JSON.parse(readFileSync(path.join(directory, file), "utf8")) as unknown;
      const report = await importStoryArcContentPackage(input, { dryRun: true, actorId: "dry-run" });
      reports.push({
        file,
        ok: report.ok,
        creates: report.creates,
        unchanged: report.unchanged,
        conflicts: report.conflicts,
      });
    }
    console.log(JSON.stringify({ canonicalBefore, reports }, null, 2));
    if (reports.some((report) => !report.ok)) process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();
