ALTER TABLE "AppUserAccess" ADD COLUMN IF NOT EXISTS "sourcePaymentId" TEXT;

ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "sourcePaymentId" TEXT;

CREATE INDEX IF NOT EXISTS "AppUserAccess_sourcePaymentId_idx" ON "AppUserAccess"("sourcePaymentId");

CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_sourcePaymentId_key" ON "Subscription"("sourcePaymentId");
