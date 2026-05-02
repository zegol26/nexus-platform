import { seedPlatform } from "./seed-platform";
import { seedCurriculum } from "./seed-curriculum";
import { seedFlashcards } from "./seed-flashcards";
import { seedNihongoBadges } from "./seed-nihongo-badges";
import { seedAssessmentQuestions } from "./seed-assessment-questions";
import { seedNihongoLessonContent } from "./seed-nihongo-lesson-content";
import { seedNihongoMockTests } from "./seed-nihongo-mock-tests";
import { prisma } from "./seed-client";

async function main() {
  await seedPlatform();
  await seedCurriculum();
  await seedFlashcards();
  await seedNihongoBadges();
  await seedAssessmentQuestions();
  await seedNihongoLessonContent();
  await seedNihongoMockTests();
}

main()
  .then(() => {
    console.log("Seed completed");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
