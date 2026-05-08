-- Add casualties tracking and defender notification timestamp to GameBattleLog
ALTER TABLE "GameBattleLog"
  ADD COLUMN "attackerCasualtiesJson" JSONB,
  ADD COLUMN "defenderCasualtiesJson" JSONB,
  ADD COLUMN "defenderSeenAt" TIMESTAMP(3);

CREATE INDEX "GameBattleLog_defenderKingdomId_defenderSeenAt_idx"
  ON "GameBattleLog"("defenderKingdomId", "defenderSeenAt");
