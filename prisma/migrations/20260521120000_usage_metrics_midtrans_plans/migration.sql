ALTER TABLE "SubscriptionPlan"
ADD COLUMN IF NOT EXISTS "billingPeriod" TEXT NOT NULL DEFAULT 'MONTHLY';

CREATE INDEX IF NOT EXISTS "SubscriptionPlan_billingPeriod_idx"
ON "SubscriptionPlan"("billingPeriod");

CREATE TABLE IF NOT EXISTS "ServerRouteMetric" (
  "id" TEXT NOT NULL,
  "route" TEXT NOT NULL,
  "method" TEXT NOT NULL,
  "routeType" TEXT NOT NULL DEFAULT 'api',
  "riskLevel" TEXT NOT NULL DEFAULT 'unknown',
  "windowStart" TIMESTAMP(3) NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "totalDurationMs" INTEGER NOT NULL DEFAULT 0,
  "maxDurationMs" INTEGER NOT NULL DEFAULT 0,
  "slowCount" INTEGER NOT NULL DEFAULT 0,
  "errorCount" INTEGER NOT NULL DEFAULT 0,
  "lastStatus" INTEGER,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ServerRouteMetric_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ServerRouteMetric_route_method_windowStart_key"
ON "ServerRouteMetric"("route", "method", "windowStart");

CREATE INDEX IF NOT EXISTS "ServerRouteMetric_windowStart_idx"
ON "ServerRouteMetric"("windowStart");

CREATE INDEX IF NOT EXISTS "ServerRouteMetric_riskLevel_idx"
ON "ServerRouteMetric"("riskLevel");

CREATE INDEX IF NOT EXISTS "ServerRouteMetric_routeType_idx"
ON "ServerRouteMetric"("routeType");
