-- CreateTable
CREATE TABLE "GameKingdom" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "continent" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "castleLevel" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "resourcesJson" JSONB NOT NULL,
    "heroKey" TEXT NOT NULL DEFAULT 'ARJUNA',
    "selectedAttackWeaponKey" TEXT NOT NULL DEFAULT 'MOONLIGHT_KUNAI_STORM',
    "selectedDefenseWeaponKey" TEXT NOT NULL DEFAULT 'SILVER_MOON_TOWER',
    "shieldUntil" TIMESTAMP(3),
    "lastDailyLoginRewardAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameKingdom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameResourceLedger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kingdomId" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "resourcesJson" JSONB NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameResourceLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameArmyUnit" (
    "id" TEXT NOT NULL,
    "kingdomId" TEXT NOT NULL,
    "unitKey" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "defenseQuantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameArmyUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameBattleLog" (
    "id" TEXT NOT NULL,
    "attackerKingdomId" TEXT NOT NULL,
    "defenderKingdomId" TEXT NOT NULL,
    "continent" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "attackerPower" INTEGER NOT NULL,
    "defenderPower" INTEGER NOT NULL,
    "stolenResourcesJson" JSONB NOT NULL,
    "casualtiesJson" JSONB NOT NULL,
    "snapshotJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameBattleLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameUserCard" (
    "id" TEXT NOT NULL,
    "kingdomId" TEXT NOT NULL,
    "cardKey" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameUserCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameLearningRewardDailyCounter" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "counterDate" TEXT NOT NULL,
    "flashcardCount" INTEGER NOT NULL DEFAULT 0,
    "quizCount" INTEGER NOT NULL DEFAULT 0,
    "mockCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameLearningRewardDailyCounter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameKingdom_userId_key" ON "GameKingdom"("userId");

-- CreateIndex
CREATE INDEX "GameKingdom_continent_idx" ON "GameKingdom"("continent");

-- CreateIndex
CREATE INDEX "GameKingdom_xp_idx" ON "GameKingdom"("xp");

-- CreateIndex
CREATE INDEX "GameKingdom_castleLevel_idx" ON "GameKingdom"("castleLevel");

-- CreateIndex
CREATE INDEX "GameResourceLedger_kingdomId_idx" ON "GameResourceLedger"("kingdomId");

-- CreateIndex
CREATE INDEX "GameResourceLedger_sourceType_idx" ON "GameResourceLedger"("sourceType");

-- CreateIndex
CREATE INDEX "GameResourceLedger_createdAt_idx" ON "GameResourceLedger"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GameResourceLedger_userId_sourceKey_key" ON "GameResourceLedger"("userId", "sourceKey");

-- CreateIndex
CREATE INDEX "GameArmyUnit_kingdomId_idx" ON "GameArmyUnit"("kingdomId");

-- CreateIndex
CREATE UNIQUE INDEX "GameArmyUnit_kingdomId_unitKey_key" ON "GameArmyUnit"("kingdomId", "unitKey");

-- CreateIndex
CREATE INDEX "GameBattleLog_attackerKingdomId_idx" ON "GameBattleLog"("attackerKingdomId");

-- CreateIndex
CREATE INDEX "GameBattleLog_defenderKingdomId_idx" ON "GameBattleLog"("defenderKingdomId");

-- CreateIndex
CREATE INDEX "GameBattleLog_continent_idx" ON "GameBattleLog"("continent");

-- CreateIndex
CREATE INDEX "GameBattleLog_createdAt_idx" ON "GameBattleLog"("createdAt");

-- CreateIndex
CREATE INDEX "GameUserCard_kingdomId_idx" ON "GameUserCard"("kingdomId");

-- CreateIndex
CREATE UNIQUE INDEX "GameUserCard_kingdomId_cardKey_key" ON "GameUserCard"("kingdomId", "cardKey");

-- CreateIndex
CREATE INDEX "GameLearningRewardDailyCounter_counterDate_idx" ON "GameLearningRewardDailyCounter"("counterDate");

-- CreateIndex
CREATE UNIQUE INDEX "GameLearningRewardDailyCounter_userId_counterDate_key" ON "GameLearningRewardDailyCounter"("userId", "counterDate");

-- AddForeignKey
ALTER TABLE "GameKingdom" ADD CONSTRAINT "GameKingdom_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameResourceLedger" ADD CONSTRAINT "GameResourceLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameResourceLedger" ADD CONSTRAINT "GameResourceLedger_kingdomId_fkey" FOREIGN KEY ("kingdomId") REFERENCES "GameKingdom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameArmyUnit" ADD CONSTRAINT "GameArmyUnit_kingdomId_fkey" FOREIGN KEY ("kingdomId") REFERENCES "GameKingdom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameBattleLog" ADD CONSTRAINT "GameBattleLog_attackerKingdomId_fkey" FOREIGN KEY ("attackerKingdomId") REFERENCES "GameKingdom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameBattleLog" ADD CONSTRAINT "GameBattleLog_defenderKingdomId_fkey" FOREIGN KEY ("defenderKingdomId") REFERENCES "GameKingdom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameUserCard" ADD CONSTRAINT "GameUserCard_kingdomId_fkey" FOREIGN KEY ("kingdomId") REFERENCES "GameKingdom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameLearningRewardDailyCounter" ADD CONSTRAINT "GameLearningRewardDailyCounter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
