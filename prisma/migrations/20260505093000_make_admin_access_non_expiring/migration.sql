-- Keep platform admins non-expiring instead of storing very large expiry dates.
UPDATE "AppUserAccess" AS aua
SET "accessExpiresAt" = NULL,
    "billingPlan" = 'ADMIN',
    "billingPeriod" = 'NON_EXPIRING'
FROM "User" AS u
WHERE aua."userId" = u."id"
  AND u."role" IN ('ADMIN', 'SUPER_ADMIN');
