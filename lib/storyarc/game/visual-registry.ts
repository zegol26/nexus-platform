export type StoryArcEpisodeVisual = {
  background: string;
  backgroundAlt: string;
  sceneTitle: string;
  ambience: string;
  camera: "left" | "center" | "right";
  light: "morning" | "day" | "afternoon" | "evening" | "cool";
  foreground: "leaves" | "windows" | "tables" | "banners" | "papers" | "screens" | "books" | "none";
};

const locationArt: Record<string, Pick<StoryArcEpisodeVisual, "background" | "backgroundAlt">> = {
  "loc-gate": { background: "/storyarc/scenes/school-gate-indonesia-v2.webp", backgroundAlt: "Indonesian Cakrawala school front gate with tropical trees and the red-and-white flag" },
  "loc-corridor": { background: "/storyarc/scenes/corridor-indonesia-v2.webp", backgroundAlt: "Open-air Indonesian school corridor beside a tropical courtyard" },
  "loc-cafeteria": { background: "/storyarc/scenes/cafeteria-indonesia-v2.webp", backgroundAlt: "Modern Indonesian school canteen" },
  "loc-hall": { background: "/storyarc/scenes/hall-indonesia-v2.webp", backgroundAlt: "Indonesian school assembly hall prepared for a club fair" },
  "loc-clubroom": { background: "/storyarc/scenes/clubroom-indonesia-v2.webp", backgroundAlt: "Cakrawala English club room with Indonesian design details" },
  "loc-workshop": { background: "/storyarc/scenes/workshop-v1.webp", backgroundAlt: "SMK multimedia workshop" },
  "loc-library": { background: "/storyarc/scenes/library-v1.webp", backgroundAlt: "Cakrawala school library" },
  "loc-office": { background: "/storyarc/scenes/principal-office-v1.webp", backgroundAlt: "Principal office" },
  "loc-workplace": { background: "/storyarc/scenes/workplace-v1.webp", backgroundAlt: "Creative technology internship workplace" },
};

const episodeDirection: Record<string, Omit<StoryArcEpisodeVisual, "background" | "backgroundAlt">> = {
  "sm-g10-01": { sceneTitle: "First Morning", ambience: "Gate birds · first bell", camera: "center", light: "morning", foreground: "leaves" },
  "sm-g10-02": { sceneTitle: "The 10-B Corridor", ambience: "Footsteps · distant classes", camera: "right", light: "day", foreground: "windows" },
  "sm-g10-03": { sceneTitle: "Lunch Rush", ambience: "Lunch crowd · trays", camera: "left", light: "day", foreground: "tables" },
  "sm-g10-04": { sceneTitle: "Club Fair", ambience: "PA system · booth chatter", camera: "center", light: "cool", foreground: "banners" },
  "sm-g10-05": { sceneTitle: "The Empty Club", ambience: "Old fan · quiet room", camera: "left", light: "afternoon", foreground: "papers" },
  "sm-g10-06": { sceneTitle: "Signature Run", ambience: "Passing period · footsteps", camera: "left", light: "afternoon", foreground: "papers" },
  "sm-g10-07": { sceneTitle: "Exchange Email", ambience: "Keyboard · ceiling fan", camera: "right", light: "evening", foreground: "screens" },
  "sm-g10-08": { sceneTitle: "Campus Tour", ambience: "Camera shutters · equipment", camera: "right", light: "cool", foreground: "screens" },
  "sm-g10-09": { sceneTitle: "Farewell Story", ambience: "Rain outside · club clock", camera: "center", light: "evening", foreground: "papers" },
  "sm-g11-01": { sceneTitle: "Budget Night", ambience: "Calculator · planning board", camera: "right", light: "evening", foreground: "papers" },
  "sm-g11-02": { sceneTitle: "The Proposal", ambience: "Office clock · air conditioner", camera: "center", light: "day", foreground: "papers" },
  "sm-g11-03": { sceneTitle: "Green Light", ambience: "Markers · excited voices", camera: "left", light: "day", foreground: "papers" },
  "sm-g11-04": { sceneTitle: "Missed Deadline", ambience: "Computer fans · warning tone", camera: "left", light: "cool", foreground: "screens" },
  "sm-g11-05": { sceneTitle: "The Argument", ambience: "Storm wind · tense silence", camera: "right", light: "evening", foreground: "windows" },
  "sm-g11-06": { sceneTitle: "Repair Work", ambience: "After-school cafeteria", camera: "right", light: "afternoon", foreground: "tables" },
  "sm-g11-07": { sceneTitle: "Rehearsal", ambience: "Stage echo · microphone", camera: "left", light: "cool", foreground: "banners" },
  "sm-g11-08": { sceneTitle: "Festival Day", ambience: "Applause · festival music", camera: "right", light: "day", foreground: "banners" },
  "sm-g11-09": { sceneTitle: "After the Lights", ambience: "Stacking chairs · night rain", camera: "center", light: "evening", foreground: "papers" },
  "sm-g12-01": { sceneTitle: "Career Day", ambience: "Audience murmur · stage cues", camera: "left", light: "day", foreground: "banners" },
  "sm-g12-02": { sceneTitle: "The Application", ambience: "Turning pages · quiet typing", camera: "right", light: "afternoon", foreground: "books" },
  "sm-g12-03": { sceneTitle: "The Call", ambience: "Phone rings · held breath", camera: "left", light: "evening", foreground: "windows" },
  "sm-g12-04": { sceneTitle: "First Day at Work", ambience: "Studio activity · keyboards", camera: "center", light: "day", foreground: "screens" },
  "sm-g12-05": { sceneTitle: "The Mistake", ambience: "Alert chime · office silence", camera: "right", light: "cool", foreground: "screens" },
  "sm-g12-06": { sceneTitle: "The Log", ambience: "Printer · evening traffic", camera: "left", light: "evening", foreground: "papers" },
  "sm-g12-07": { sceneTitle: "Two Letters", ambience: "Envelope paper · old fan", camera: "right", light: "afternoon", foreground: "papers" },
  "sm-g12-08": { sceneTitle: "The Interview", ambience: "Office clock · calm room", camera: "center", light: "cool", foreground: "none" },
  "sm-g12-09": { sceneTitle: "Graduation Morning", ambience: "Crowd outside · final bell", camera: "right", light: "morning", foreground: "leaves" },
};

export function getEpisodeVisual(episodeId: string, locationId: string): StoryArcEpisodeVisual {
  const art = locationArt[locationId] ?? locationArt["loc-gate"];
  const direction = episodeDirection[episodeId] ?? {
    sceneTitle: "Cakrawala Story", ambience: "Campus ambience", camera: "center" as const,
    light: "day" as const, foreground: "none" as const,
  };
  return { ...art, ...direction };
}
