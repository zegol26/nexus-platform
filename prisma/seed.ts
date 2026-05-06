import { seedPlatform } from "./seed-platform";
import { seedCurriculum } from "./seed-curriculum";
import { seedFlashcards } from "./seed-flashcards";
import { seedNihongoBadges } from "./seed-nihongo-badges";
import { seedAssessmentQuestions } from "./seed-assessment-questions";
import { seedNihongoLessonContent } from "./seed-nihongo-lesson-content";
import { seedNihongoMockTests } from "./seed-nihongo-mock-tests";
import { seedEnglishInterview } from "./seed-english-interview";
import { seedReadingPassages } from "./seed-reading-passages";
import { seedReadingArticles } from "./seed-reading-articles";
import { seedCharacterContent } from "./seed-character-content";
import { prisma } from "./seed-client";

async function main() {
  await seedPlatform();
  await seedCurriculum();
  await seedCharacterContent();
  await seedFlashcards();
  await seedNihongoBadges();
  await seedAssessmentQuestions();
  await seedNihongoLessonContent();
  await seedReadingPassages();
  await seedNihongoMockTests();
  await seedReadingArticles();
  await seedEnglishInterview();
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
