# Vercel Fluid CPU + Midtrans UAT Notes

## Fluid CPU Countermeasures

- Production build no longer runs Prisma seed by default. Set `RUN_SEED_ON_BUILD=true` only when a deploy intentionally needs seed data.
- Prisma `pg` pool is attached to Vercel Functions with `attachDatabasePool(pool)` so idle database clients can be released safely under Fluid Compute.
- `/admin/usage` includes a sampled route meter from `ServerRouteMetric`.
- Route metrics are lightweight:
  - every instrumented request logs structured JSON to runtime logs;
  - database aggregation is sampled by `ROUTE_METRICS_SAMPLE_RATE` and always stored for slow/error requests;
  - voice routes currently store every request because they are the highest risk path.

## UAT Checks

1. Run migration and generate Prisma Client.
2. Open `/admin/usage`.
3. Trigger voice speak/transcribe and billing invoice flows.
4. Confirm route rows appear in the Fluid CPU Route Meter.
5. Keep an eye on slow/error counts before enabling more instrumentation.

## Midtrans Setup

Set these env vars for sandbox UAT:

```txt
MIDTRANS_SANDBOX_SERVER_KEY=
NEXT_PUBLIC_MIDTRANS_SANDBOX_CLIENT_KEY=
NEXT_PUBLIC_APP_URL=
```

Midtrans Finish Redirect URL:

```txt
https://nexustalenta-academy.com/payment/finish
```

This page is public and safe for Midtrans to redirect customers to after
payment. Authenticated users can continue to billing/dashboard from the finish
page without losing their login state.

Production vars for the live gateway:

```txt
MIDTRANS_MERCHANT_ID=
MIDTRANS_PRODUCTION_SERVER_KEY=
NEXT_PUBLIC_MIDTRANS_PRODUCTION_CLIENT_KEY=
```

Runtime policy:

- Production gateway is always on in Vercel production deployments when the
  production server key is configured.
- Admin UI must not switch the live gateway into or out of production mode.
- Admin UI may only open/close sandbox checkout for UAT.
- `MIDTRANS_MODE` in `PlatformSetting` is retained for legacy sandbox records
  and non-production UAT only; production runtime ignores it and uses
  production mode.

Sandbox UAT flow:

1. Go to `/admin/settings`.
2. Confirm subscription plans for each app: monthly, quarterly, yearly.
3. Open sandbox checkout from Admin Settings or `/admin/payments`.
4. User opens `/platform/billing`, selects Midtrans, and creates invoice.
5. Midtrans notification URL should point to:

```txt
https://YOUR_DOMAIN/api/platform/billing/midtrans/webhook
```

6. Midtrans Finish Redirect URL should point to:

```txt
https://YOUR_DOMAIN/payment/finish
```

Do not perform production alias or production deploy changes until sandbox
payment, webhook, access activation, admin payment history, `/checkout`, and
`/api/auth/csrf` are all verified on the candidate deployment URL.

## RCA: 2026-05-27 Payment Gateway Regression

### Impact

- The custom domain `nexustalenta-academy.com` was temporarily pointed to a
  deployment whose database/auth environment was not equivalent to the live
  Academy deployment.
- `/checkout` returned HTTP 500 because runtime `DATABASE_URL` resolved to a
  local-only database endpoint.
- Login submission failed while NextAuth secret/database env validation was
  inconsistent on the selected deployment.

### Root Cause

- The live Academy domain and the local working tree were not verified against
  the same Vercel project before deployment and alias changes.
- A direct `vercel deploy --prod` path allowed local `.env` state to influence
  the deployment package and created a deployment that was not safe to alias.
- The Admin Console exposed production/sandbox switching as a runtime button,
  making a live payment gateway look like a reversible UI setting instead of
  deployment environment configuration.

### Countermeasures

- Added `.vercelignore` so local `.env` files are never uploaded by direct
  Vercel deployments.
- Production Midtrans keys live only in Vercel Environment Variables and are
  not stored in admin UI, docs, screenshots, or source.
- Production Midtrans mode is now selected by production runtime; it is always
  open when the production server key is configured.
- Admin payment controls now operate only on sandbox UAT checkout open/closed
  state.
- Finish Redirect URL is `/payment/finish`, not `/platform/billing`, so the
  customer receives a stable post-payment page before returning to dashboard or
  billing.
- Authenticated platform sessions use a 4-hour idle timeout. Navigation from
  login/dashboard back to Academy Home must not sign the user out; explicit
  logout and 4 hours of inactivity are the logout boundaries.
- Before aliasing `nexustalenta-academy.com`, verify:
  - `vercel inspect <candidate-deployment>` shows the intended project;
  - `vercel alias ls` shows which deployment currently owns the domain;
  - `/checkout` returns 200 on the candidate URL;
  - `/api/auth/csrf` returns 200 on the candidate URL;
  - a sandbox Snap transaction can be created with sandbox keys;
  - no local `.env` file is present in the deployment output.
