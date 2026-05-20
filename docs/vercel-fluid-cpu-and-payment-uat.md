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

Optional production vars, only after UAT:

```txt
MIDTRANS_PRODUCTION_SERVER_KEY=
NEXT_PUBLIC_MIDTRANS_PRODUCTION_CLIENT_KEY=
```

Admin flow:

1. Go to `/admin/settings`.
2. Confirm subscription plans for each app: monthly, quarterly, yearly.
3. Set Midtrans mode to `sandbox`.
4. Enable Midtrans checkout.
5. User opens `/platform/billing`, selects Midtrans, and creates invoice.
6. Midtrans notification URL should point to:

```txt
https://YOUR_DOMAIN/api/platform/billing/midtrans/webhook
```

Do not switch to production mode until sandbox payment, webhook, access activation, and admin payment history are all verified.
