import { foundationLevel } from "./foundation";
import { intermediateLevel } from "./intermediate";
import { advancedLevel } from "./advanced";
import type { DceLevel, DceLevelId, DceModule } from "./types";
import { expandDceLevelQuestions } from "./question-expander";

export * from "./types";
export { dcePersonas, findPersona } from "./personas";

export const dceCurriculum: DceLevel[] = [
  foundationLevel,
  intermediateLevel,
  advancedLevel,
].map(expandDceLevelQuestions);

export function findLevel(level: string): DceLevel | undefined {
  return dceCurriculum.find((entry) => entry.level === level);
}

export function findModule(
  level: string,
  moduleSlug: string
): { level: DceLevel; module: DceModule } | undefined {
  const entry = findLevel(level);
  if (!entry) return undefined;
  const found = entry.modules.find((current) => current.slug === moduleSlug);
  if (!found) return undefined;
  return { level: entry, module: found };
}

export type DceNextCourseItem = {
  level: DceLevel;
  module: DceModule;
  href: string;
  label: "Next Section" | "Next Course";
};

export function getNextEnglishCourseItem(
  currentLevel: string,
  currentModuleSlug: string
): DceNextCourseItem | undefined {
  const levelIndex = dceCurriculum.findIndex((entry) => entry.level === currentLevel);
  if (levelIndex < 0) return undefined;

  const level = dceCurriculum[levelIndex];
  const moduleIndex = level.modules.findIndex((entry) => entry.slug === currentModuleSlug);
  if (moduleIndex < 0) return undefined;

  const nextModule = level.modules[moduleIndex + 1];
  if (nextModule) {
    return {
      level,
      module: nextModule,
      href: `/apps/english/dce/${level.level}/${nextModule.slug}`,
      label: "Next Section",
    };
  }

  const nextLevel = dceCurriculum[levelIndex + 1];
  const firstModule = nextLevel?.modules[0];
  if (!nextLevel || !firstModule) return undefined;

  return {
    level: nextLevel,
    module: firstModule,
    href: `/apps/english/dce/${nextLevel.level}/${firstModule.slug}`,
    label: "Next Course",
  };
}

export function getNextLessonInEnglishCourse(
  currentLevel: string,
  currentModuleSlug: string
) {
  return getNextEnglishCourseItem(currentLevel, currentModuleSlug);
}

export function countModuleQuestions(module: DceModule) {
  const reading = module.reading.reduce(
    (acc, item) => acc + item.questions.length,
    0
  );
  const listening = module.listening.reduce(
    (acc, item) => acc + item.questions.length,
    0
  );
  const dialogue = module.dialogue.reduce(
    (acc, item) => acc + item.questions.length,
    0
  );
  return {
    reading,
    listening,
    dialogue,
    vocabulary: module.vocabulary.length,
    grammar: module.grammar.length,
    total:
      reading +
      listening +
      dialogue +
      module.vocabulary.length +
      module.grammar.length,
  };
}

export function curriculumStats() {
  let totalQuestions = 0;
  let totalModules = 0;
  for (const level of dceCurriculum) {
    for (const entry of level.modules) {
      totalQuestions += countModuleQuestions(entry).total;
      totalModules += 1;
    }
  }
  return {
    totalLevels: dceCurriculum.length,
    totalModules,
    totalQuestions,
  };
}

export const dceLevelOrder: DceLevelId[] = ["A1_A2", "B1_B2", "C1"];
