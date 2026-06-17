# Midtrans Billing Skill

Use this skill when changing, debugging, or extending Midtrans payment flows in
Nexus Platform, especially QRIS/Snap checkout, payment settlement, webhook
handling, payment status reconciliation, paid app access activation, and admin
payment operations.

## Required Reading

Before editing Midtrans code, read these files:

1. `AGENTS.md`
2. `docs/project-state.md`
3. `tasks/current-sprint.md`
4. `docs/known-issues.md`
5. `docs/deployment.md`
6. `docs/database.md`
7. `docs/architecture.md`
8. `skills/nexus-business-context.md`

Then inspect the current code paths below. Do not rely on memory from a prior
incident.

## Code Map

- Checkout creation:
  - `app/api/platform/billing/invoices/route.ts`
  - `lib/platform/midtrans.ts`
- Provider webhook:
  - `app/api/platform/billing/midtrans/webhook/route.ts`
- Provider status inquiry and reconciliation:
  - `lib/platform/sync-midtrans-payment.ts`
  - `app/api/platform/billing/payments/status/route.ts`
  - `scripts/reconcile-payment.ts`
- Paid access activation:
  - `lib/platform/activate-subscription.ts`
  - Prisma models: `PaymentTransaction`, `AppUserAccess`, `Subscription`
- Customer return UI:
  - `app/payment/finish/page.tsx`
  - `components/platform/PaymentFinishStatus.tsx`
- Automatic fallback sync surfaces:
  - `app/platform/billing/page.tsx`
  - `app/platform/dashboard/page.tsx`
  - `app/platform/apps/page.tsx`
  - `app/admin/payments/page.tsx`
- Admin manual sync:
  - `components/admin/AdminPaymentActions.tsx`
  - `app/api/platform/admin/payments/[paymentId]/sync-midtrans/route.ts`
- Midtrans policy docs:
  - `docs/deployment.md`

## Current Payment Flow

1. Authenticated user creates a billing invoice.
2. `app/api/platform/billing/invoices/route.ts` creates a local
   `PaymentTransaction` with provider `MIDTRANS`, a `providerRef` order id, and
   raw Snap creation payload containing `midtransMode` and `redirectUrl`.
3. Snap checkout happens on Midtrans.
4. Midtrans calls
   `/api/platform/billing/midtrans/webhook`.
5. The webhook must:
   - find the local payment by `providerRef`;
   - use the stored `midtransMode` when present;
   - validate Midtrans signature with the server key for that mode;
   - map provider status with `mapMidtransStatus`;
   - update `PaymentTransaction`;
   - activate app access and source subscription in the same database
     transaction when status maps to `PAID`.
6. The customer may return through `/payment/finish`. This page must not trust
   redirect query params as proof of payment. It polls the status endpoint,
   which can run a server-side Midtrans Status API inquiry for the exact local
   order.
7. If webhook delivery is delayed or misconfigured, automatic bounded sync runs
   on user billing/dashboard/apps pages and admin payments before rendering.
8. Admin can press `Sync Midtrans` for a selected Midtrans payment. This is only
   a provider inquiry and must not manually mark an unpaid order as paid.

## Paid Status Rules

Use `mapMidtransStatus()` as the source of truth for local status mapping.
Paid access may be activated only when Midtrans status maps to local `PAID`,
for example settlement or accepted capture.

Never activate access from:

- Snap creation success alone;
- Midtrans redirect query params alone;
- admin visual confirmation alone;
- local `PENDING` rows without a matching provider status inquiry/webhook.

When syncing with the Midtrans Status API, always validate:

- provider `order_id` equals local `PaymentTransaction.providerRef`;
- provider `gross_amount` matches local `amountCents / 100`;
- local provider is `MIDTRANS`;
- a server key exists for the resolved mode.

Do not downgrade an existing local `PAID` payment because of a later non-paid
provider response. Preserve paid access once legitimately activated.

## Access Activation Contract

Paid activation must be idempotent and database-backed:

- `PaymentTransaction.status = PAID`
- `PaymentTransaction.paidAt` set
- `AppUserAccess` upserted by `userId + appId`
- `Subscription` upserted by `sourcePaymentId`
- `AppUserAccess.sourcePaymentId` and `Subscription.sourcePaymentId` linked to
  the payment when available

Use `activatePaidAccessForPayment(tx, paymentId)` inside an existing Prisma
transaction when payment status is being updated in the same operation. Use
`activatePaidAccess(paymentId)` only when a standalone activation wrapper is
needed.

## Admin Operations

The admin payments screen is allowed to show `Sync Midtrans` for Midtrans
orders. It must not show manual `Verify Paid` as the normal path for Midtrans
orders because that bypasses provider settlement validation.

Expected manual sync behavior:

- unauthenticated request returns `403`;
- non-Midtrans payment returns an error;
- provider mismatch returns an error and does not mutate access;
- provider pending keeps local status pending;
- provider settlement updates local status to `PAID` and activates app access.

Manual proof verification remains for non-Midtrans/manual payment flows.

## Production Deployment Checklist

Before promoting a Midtrans change:

1. Run `npm run lint`.
2. Run `npx tsc --noEmit --pretty false`.
3. Run `npm test`.
4. Run `npm run build`.
5. Verify candidate deployment:
   - `/checkout` returns `200`;
   - `/api/auth/csrf` returns `200`;
   - `/payment/finish?order_id=<known-order>` returns `200`;
   - admin sync route exists and returns `403` without login, not `404`.
6. Verify the custom domain alias:
   - `vercel alias ls`
   - ensure `nexustalenta-academy.com` points to the intended latest production
     deployment, not an older deployment.
7. Confirm Midtrans Dashboard notification URL is:
   - `https://nexustalenta-academy.com/api/platform/billing/midtrans/webhook`
8. Confirm Finish Redirect URL is:
   - `https://nexustalenta-academy.com/payment/finish`

## Incident Pattern: Paid in Midtrans, Pending in Nexus

If Midtrans shows paid/settlement but Nexus shows pending:

1. Check whether the production domain is serving the latest deployment.
2. Check whether the payment exists in the production database by `providerRef`.
3. Open `/admin/payments` as admin; automatic sync should run before render.
4. If still pending, press `Sync Midtrans` on the payment.
5. Confirm status endpoint result:
   - `/api/platform/billing/payments/status?orderId=<order-id>`
6. Acceptance criteria:
   - response `paymentStatus` is `PAID`;
   - `accessActive` is `true`;
   - `accessStatus` is `ACTIVE`;
   - admin dashboard shows paid after refresh.

## Notes From 2026-06-17 Incident

The affected orders were:

- `nexus-1781659578035-f7425e21b8c6` for Nexus AI Arabic monthly.
- `nexus-1781676345935-2ecabf03eafc58` for Nexus AI English monthly.

Root causes and lessons:

- Production had not yet received the new sync code, so the admin button and
  automatic inquiry were absent.
- After pushing `main`, the Vercel production deployment was ready, but
  `nexustalenta-academy.com` still pointed at an older deployment. The domain
  alias had to be repointed with `vercel alias set`.
- Once the custom domain served the new build, the status endpoint successfully
  inquired Midtrans and updated both orders to `PAID` with active app access.

