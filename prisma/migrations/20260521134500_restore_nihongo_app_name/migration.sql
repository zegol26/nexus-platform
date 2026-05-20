UPDATE "PlatformApp"
SET
  "name" = 'Nexus AI Nihongo',
  "description" = 'AI Japanese learning app for JLPT and JFT learners',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'nihongo';

UPDATE "SubscriptionPlan"
SET
  "name" = REPLACE("name", 'Nexus Academy', 'Nihongo'),
  "description" = REPLACE(COALESCE("description", ''), 'Nexus Talenta Indonesia Academy', 'Nexus AI Nihongo'),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "code" LIKE 'NIHONGO_%';
