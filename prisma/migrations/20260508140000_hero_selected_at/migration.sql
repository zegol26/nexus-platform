-- Lock hero selection after first confirmation
ALTER TABLE "GameKingdom"
  ADD COLUMN "heroSelectedAt" TIMESTAMP(3);
