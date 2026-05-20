UPDATE "PlatformApp"
SET
  "name" = 'Nexus Talenta Indonesia Academy',
  "description" = 'Japanese, language, and career-preparation academy for Indonesian learners',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'nihongo';

UPDATE "SubscriptionPlan"
SET
  "name" = REPLACE("name", 'Nihongo', 'Nexus Academy'),
  "description" = REPLACE(COALESCE("description", ''), 'Nexus AI Nihongo', 'Nexus Talenta Indonesia Academy'),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "code" LIKE 'NIHONGO_%';
