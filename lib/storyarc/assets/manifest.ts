export type StoryArcAssetManifestEntry = {
  assetId: string;
  revision: number;
  type: "PROCEDURAL_SCENE" | "PROCEDURAL_CHARACTER" | "PROCEDURAL_PARTICLE";
  purpose: string;
  sourceType: "original-human";
  sourceReference: string;
  authorOrGenerator: string;
  license: "NEXUS-PROPRIETARY";
  commercialUseAllowed: true;
  derivativeUseAllowed: true;
  attributionRequired: false;
  rightsOwner: "Nexus Talenta Indonesia Academy";
  approvalStatus: "TEMPORARY_APPROVED";
  storageLocation: string;
  temporary: true;
  sceneIds: readonly string[];
  byteSize: 0;
};

export const STORYARC_PHASE_A_ASSETS: readonly StoryArcAssetManifestEntry[] = [
  {
    assetId: "scene-school-gate-procedural-v1",
    revision: 1,
    type: "PROCEDURAL_SCENE",
    purpose: "Layered School Gate background, clouds, campus, trees, and sign",
    sourceType: "original-human",
    sourceReference: "lib/storyarc/game/create-school-gate-game.ts",
    authorOrGenerator: "Nexus StoryArc implementation",
    license: "NEXUS-PROPRIETARY",
    commercialUseAllowed: true,
    derivativeUseAllowed: true,
    attributionRequired: false,
    rightsOwner: "Nexus Talenta Indonesia Academy",
    approvalStatus: "TEMPORARY_APPROVED",
    storageLocation: "procedural://storyarc/school-gate/v1",
    temporary: true,
    sceneIds: ["scene-school-gate"],
    byteSize: 0,
  },
  {
    assetId: "char-hana-procedural-v1",
    revision: 1,
    type: "PROCEDURAL_CHARACTER",
    purpose: "Original temporary Hana body, face, blink, breathing, and expressions",
    sourceType: "original-human",
    sourceReference: "lib/storyarc/game/create-school-gate-game.ts",
    authorOrGenerator: "Nexus StoryArc implementation",
    license: "NEXUS-PROPRIETARY",
    commercialUseAllowed: true,
    derivativeUseAllowed: true,
    attributionRequired: false,
    rightsOwner: "Nexus Talenta Indonesia Academy",
    approvalStatus: "TEMPORARY_APPROVED",
    storageLocation: "procedural://storyarc/hana/v1",
    temporary: true,
    sceneIds: ["scene-school-gate"],
    byteSize: 0,
  },
  {
    assetId: "fx-petals-procedural-v1",
    revision: 1,
    type: "PROCEDURAL_PARTICLE",
    purpose: "Low-cost environmental petal particles",
    sourceType: "original-human",
    sourceReference: "lib/storyarc/game/create-school-gate-game.ts",
    authorOrGenerator: "Nexus StoryArc implementation",
    license: "NEXUS-PROPRIETARY",
    commercialUseAllowed: true,
    derivativeUseAllowed: true,
    attributionRequired: false,
    rightsOwner: "Nexus Talenta Indonesia Academy",
    approvalStatus: "TEMPORARY_APPROVED",
    storageLocation: "procedural://storyarc/petals/v1",
    temporary: true,
    sceneIds: ["scene-school-gate"],
    byteSize: 0,
  },
] as const;

export const STORYARC_PHASE_A_ASSET_BYTES = STORYARC_PHASE_A_ASSETS.reduce(
  (total, asset) => total + asset.byteSize,
  0,
);
