# Lessons Learned

## Production Seed Data Loss

- Incident: stale seed scripts removed lessons 41 and 42 and reset admin app access.
- Root cause: production builds ran old `deleteMany()`-style seed code from git while local fixes were not committed.
- Fix: restored lessons, switched curriculum/admin access seeds to safe upsert/reconciliation, synced local production code to git, tagged a checkpoint.
- Rule: seeds for user-visible data must be idempotent, non-destructive, and committed before deployment.

## Vercel Domain And Payment Regression

- Incident: `nexustalenta-academy.com/checkout` returned 500 and login was affected after a domain pointed to a deployment with mismatched env/database configuration.
- Root cause: candidate deployment was not verified against the intended Vercel project and environment before alias change; direct deploys allowed local env risk.
- Fix: restored stable deployment, added `.vercelignore`, moved production Midtrans control to environment runtime, limited admin UI to sandbox UAT.
- Rule: inspect deployments, check aliases, and verify `/checkout`, `/api/auth/csrf`, auth, billing, and sandbox payment before aliasing production.

## Vercel Filesystem Write Failure

- Incident: manual billing proof upload hung because Vercel Functions could not persist `public/uploads`.
- Root cause: assuming runtime filesystem writes survive in serverless deployment.
- Fix: stored uploaded proof image as a base64 data URL in `PaymentProof.fileUrl` and improved client error handling.
- Rule: use durable storage for uploaded assets; database data URLs are MVP-only.

## Prisma Build-Time Env Failure

- Incident: importing Prisma at build/page-data time could throw when `DATABASE_URL` was unavailable.
- Root cause: Prisma client initialization happened at module import time.
- Fix: lazy Prisma proxy defers pool/client creation until first property access and attaches pg pool to Vercel Functions.
- Rule: avoid runtime env checks in module bodies for files imported during Next build.

## Payment Plan Catalog Regression

- Incident: checkout/billing could show only monthly or let a monthly row appear quarterly/yearly.
- Root cause: period and duration were editable on a single plan row, and catalog repair treated the monthly code as canonical monthly.
- Fix: self-heal separate Monthly/Quarterly/Yearly rows per app, lock period/duration in admin UI, edit price/active only.
- Rule: business-facing payment settings must map cleanly to immutable billing semantics.

## Next.js And React Compiler Friction

- Incident: theme/provider and game effects triggered framework/compiler warnings or lint blockers.
- Root cause: older assumptions around Next/React behavior and synchronous effect state updates.
- Fix: route-scoped Nihongo theme provider, render-safe ref/state patterns, local docs reminder.
- Rule: check current Next.js 16 patterns before applying older framework knowledge.

## Listening Translation Parser

- Incident: Indonesian translations did not render for some listening content.
- Root cause: parser expected one JSON shape/key.
- Fix: parser accepts `indonesia`, `indonesian`, `id`, `translation`, and `terjemahan` in object or per-line array shapes.
- Rule: content importers should tolerate realistic editorial variation and normalize at the boundary.

## Nexus Kingdom Target Visibility

- Incident: defenders saw attack notifications but could not find attackers in the visible target list.
- Root cause: server returned cross-continent targets, but UI only rendered a six-item preview and ordering did not prioritize recent attackers.
- Fix: target scouting prioritizes recent attackers and UI renders all returned targets in a scrollable list.
- Rule: never truncate operationally important retaliation/action lists without an explicit search or pagination affordance.

## John English-Only Guard

- Incident: John in Nexus AI English could occasionally answer while reading or reflecting Japanese/non-English script despite prompt rules.
- Root cause: prompt-only language constraints are not reliable enough for user-facing AI behavior.
- Fix: added a server-side forbidden-script guard and repair/fallback path for John chat and DCE roleplay opening generation.
- Rule: high-value AI behavior constraints need deterministic server-side validation, not only prompt wording.
