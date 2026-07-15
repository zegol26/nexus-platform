ALTER TABLE "StoryArcPlayerTransition"
ADD CONSTRAINT "StoryArcPlayerTransition_sourceRevisionId_fkey"
FOREIGN KEY ("sourceRevisionId") REFERENCES "StoryArcContentRevision"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
