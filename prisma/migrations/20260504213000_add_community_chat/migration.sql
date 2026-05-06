-- CreateTable
CREATE TABLE "CommunityRoom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityMessage" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "replyToId" TEXT,
    "linkedRoomId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityMessageReaction" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'ONIGIRI',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityMessageReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommunityRoom_createdById_idx" ON "CommunityRoom"("createdById");

-- CreateIndex
CREATE INDEX "CommunityRoom_createdAt_idx" ON "CommunityRoom"("createdAt");

-- CreateIndex
CREATE INDEX "CommunityMessage_roomId_idx" ON "CommunityMessage"("roomId");

-- CreateIndex
CREATE INDEX "CommunityMessage_authorId_idx" ON "CommunityMessage"("authorId");

-- CreateIndex
CREATE INDEX "CommunityMessage_replyToId_idx" ON "CommunityMessage"("replyToId");

-- CreateIndex
CREATE INDEX "CommunityMessage_linkedRoomId_idx" ON "CommunityMessage"("linkedRoomId");

-- CreateIndex
CREATE INDEX "CommunityMessage_createdAt_idx" ON "CommunityMessage"("createdAt");

-- CreateIndex
CREATE INDEX "CommunityMessageReaction_messageId_idx" ON "CommunityMessageReaction"("messageId");

-- CreateIndex
CREATE INDEX "CommunityMessageReaction_userId_idx" ON "CommunityMessageReaction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityMessageReaction_messageId_userId_type_key" ON "CommunityMessageReaction"("messageId", "userId", "type");

-- AddForeignKey
ALTER TABLE "CommunityRoom" ADD CONSTRAINT "CommunityRoom_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityMessage" ADD CONSTRAINT "CommunityMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "CommunityRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityMessage" ADD CONSTRAINT "CommunityMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityMessage" ADD CONSTRAINT "CommunityMessage_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "CommunityMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityMessage" ADD CONSTRAINT "CommunityMessage_linkedRoomId_fkey" FOREIGN KEY ("linkedRoomId") REFERENCES "CommunityRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityMessageReaction" ADD CONSTRAINT "CommunityMessageReaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "CommunityMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityMessageReaction" ADD CONSTRAINT "CommunityMessageReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
