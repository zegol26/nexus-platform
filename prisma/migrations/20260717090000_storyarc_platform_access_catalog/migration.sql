INSERT INTO "PlatformApp" (
  "id",
  "slug",
  "name",
  "description",
  "status",
  "createdAt",
  "updatedAt"
)
VALUES (
  'storyarc-platform-app',
  'storyarc',
  'Nexus StoryArc',
  'English for SMA and SMK Grades 10–12 through school learning, interactive stories, and exam practice',
  'ACTIVE',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "status" = 'ACTIVE',
  "updatedAt" = CURRENT_TIMESTAMP;
