export type StoryArcToeicPhoto = {
  src: string;
  alt: string;
};

const ASSET_ROOT = "/storyarc/exam/toeic-part-1";

const photoByBrief: Record<string, StoryArcToeicPhoto> = {
  "Foto: seorang siswa menyerahkan formulir kepada petugas di meja kantor sekolah.": { src: `${ASSET_ROOT}/school-office-form.png`, alt: "Assessment photograph for this listening question" },
  "Foto: dua siswa mengantre di depan kios makanan yang ramai.": { src: `${ASSET_ROOT}/canteen-queue.png`, alt: "Assessment photograph for this listening question" },
  "Foto: seorang teknisi muda memasang kamera pada tripod di ruang praktik.": { src: `${ASSET_ROOT}/camera-tripod.png`, alt: "Assessment photograph for this listening question" },
  "Original Nexus image brief: A technician places a camera on a tripod in the media lab.": { src: `${ASSET_ROOT}/camera-tripod.png`, alt: "Assessment photograph for this listening question" },
  "Original Nexus image brief: Three team members review a chart on a laptop.": { src: `${ASSET_ROOT}/team-laptop-chart.png`, alt: "Assessment photograph for this listening question" },
  "Original Nexus image brief: A supervisor demonstrates how to wear protective glasses.": { src: `${ASSET_ROOT}/protective-glasses-demo.png`, alt: "Assessment photograph for this listening question" },
  "Original Nexus image brief: A student checks a safety list beside a workshop machine.": { src: `${ASSET_ROOT}/workshop-safety-checklist.png`, alt: "Assessment photograph for this listening question" },
  "Original Nexus image brief: Two students hand a résumé to a career adviser at a desk.": { src: `${ASSET_ROOT}/career-adviser-resume.png`, alt: "Assessment photograph for this listening question" },
  "Original Nexus image brief: A volunteer points visitors toward the auditorium.": { src: `${ASSET_ROOT}/auditorium-directions.png`, alt: "Assessment photograph for this listening question" },
};

export function resolveStoryArcToeicPhoto(imageBriefId: unknown) {
  return typeof imageBriefId === "string" ? photoByBrief[imageBriefId] : undefined;
}
