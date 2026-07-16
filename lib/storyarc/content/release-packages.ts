import batch1 from "@/prisma/data/storyarc/batch-1-grade10-school-core.json";
import batch2 from "@/prisma/data/storyarc/batch-2-grade10-story-mode.json";
import batch3 from "@/prisma/data/storyarc/batch-3-grade10-exam-lab.json";
import batch4 from "@/prisma/data/storyarc/batch-4-grade11-school-core.json";
import batch5 from "@/prisma/data/storyarc/batch-5-grade11-story-mode.json";
import batch6 from "@/prisma/data/storyarc/batch-6-grade11-exam-lab.json";
import batch7 from "@/prisma/data/storyarc/batch-7-grade12-school-core.json";
import batch8 from "@/prisma/data/storyarc/batch-8-grade12-story-mode.json";
import batch9 from "@/prisma/data/storyarc/batch-9-grade12-exam-lab.json";

export const STORYARC_CANONICAL_RELEASE_PACKAGES = [
  { file: "batch-1-grade10-school-core.json", content: batch1 },
  { file: "batch-2-grade10-story-mode.json", content: batch2 },
  { file: "batch-3-grade10-exam-lab.json", content: batch3 },
  { file: "batch-4-grade11-school-core.json", content: batch4 },
  { file: "batch-5-grade11-story-mode.json", content: batch5 },
  { file: "batch-6-grade11-exam-lab.json", content: batch6 },
  { file: "batch-7-grade12-school-core.json", content: batch7 },
  { file: "batch-8-grade12-story-mode.json", content: batch8 },
  { file: "batch-9-grade12-exam-lab.json", content: batch9 },
] as const;

export const STORYARC_CANONICAL_RELEASE_SIZE = 90;
