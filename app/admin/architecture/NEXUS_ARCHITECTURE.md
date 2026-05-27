# Nexus Platform / Nexus AI Nihongo Architecture

Last updated: 2026-05-27

## Release Gate Status

- Unit and function tests: completed. `npm test` passed with 6 focused policy/helper tests.
- TypeScript check: completed. `npx tsc --noEmit` passed.
- Lint check: completed. `npm run lint` passed with existing image optimization warnings only.
- Local production build: completed. `npm run build` passed.
- Vercel release approval: completed.
- Vercel production deploy: completed.
- Production loaded check: completed. `/login` returned HTTP 200 on the production alias.

## Purpose

Nexus Platform is the parent application for authentication, access, billing, admin operations, and shared navigation. Nexus AI Nihongo is the first product app inside the platform and lives under the `/apps/nihongo` route space. The codebase keeps platform concerns and app concerns separated while sharing Prisma, NextAuth, layout primitives, and reusable guard utilities.

## High Level Structure

- `app/platform/*`: parent platform dashboard, billing, legacy admin access-control surface, and account-level navigation.
- `app/overview/*`: public restricted overview-trial surfaces that mimic each learning app before login/subscription.
- `app/checkout`, `app/terms`, `app/refund-policy`, `app/contact`: public commerce, legal, refund, and contact surfaces for payment-provider review and buyer clarity.
- `app/payment/finish`: public Midtrans Finish Redirect URL shown after a
  customer completes or returns from payment.
- `app/apps/nihongo/*`: Nexus AI Nihongo user experience, including curriculum, AI lesson, flashcards, tutor, reading, listening, and assessments.
- `app/apps/english/*`: Nexus AI English interview flow and user recording submission experience.
- `app/apps/arabic/*`: Nexus AI Arabic daily/work/umrah/travel learning surfaces and tutor flows.
- `app/apps/pmp/*`: Nexus PMP Exam Prep dashboard, simulator, diagnostic, knowledge base, ITTO, glossary, readiness, and AI instructor flows.
- `app/admin/*`: Operations Console for ADMIN users only. This area is intentionally hidden from non-admin navigation and protected by server-side admin checks.
- `app/api/platform/*`: platform APIs for billing, payment proof upload, and admin payment verification.
- `app/api/apps/*`: app-specific APIs for Nihongo and English features.
- `components/layout/*`: shared shell pieces such as sidebar drawer and global footer.
- `components/marketing/*`: public landing and overview components used before authentication.
- `components/platform/*`: platform navigation, billing UI, and platform-specific client components.
- `components/apps/*`: app-specific interactive client components.
- `components/admin/*`: reusable admin UI blocks and admin actions.
- `lib/auth/*`: session and admin access helpers.
- `lib/nexus/*`: reusable feature access guards and usage tracking.
- `lib/platform/*`: platform settings helpers for billing, QRIS, bank transfer, and configurable pricing.
- `prisma/schema.prisma`: source of truth for database models and enums.
- `prisma/seed*.ts`: seed scripts for platform settings, app access, reading cache, and production-safe table checks.

## Runtime Architecture

The application uses Next.js App Router with server components by default. Protected pages validate session server-side before rendering sensitive data. Client components are used only where browser APIs or interactive state are required, such as MediaRecorder, billing proof upload, settings forms, and audio assessment controls.

NextAuth owns authentication. Prisma is the database access layer. PostgreSQL stores users, roles, subscriptions, billing records, feature usage, reading cache, lesson templates, and recording metadata. Route Handlers under `app/api` validate sessions again before mutating data.

## Access Control

General platform users access `/platform/*` and app routes according to their account and app access. ADMIN-only operations use `requireAdmin()` inside `app/admin/layout.tsx`; non-admin users receive a not-found result instead of being redirected. Admin links are only visible to admin users from platform navigation.

Trial and subscription behavior is centralized in `lib/nexus/access-guards.ts`:

- `canAccessLesson(userId, lessonOrder)`: trial users can access curriculum lessons up to lesson 5.
- `canUseFlashcard(userId)`: trial users are limited to 20 flashcards.
- `canAskAiTutor(userId)`: trial users are limited to 2 AI tutor questions.
- `canAccessReading(userId)`: trial users can consume cached reading only.

Feature usage is recorded with `FeatureUsage` so limits can be enforced without scattering counters across UI code.

## Public Commerce And Overview Trial

The public web surface exists for both buyer clarity and payment-provider
review. The landing page presents Nexus Talenta Indonesia Academy as the
parent academy, lists the available learning apps, links to product
ordering, and exposes legal/refund/contact pages. Public checkout is only
an order-start surface: the user selects or reviews a program, then logs
in or registers before completing billing inside the platform.

Overview trials under `/overview/[app]` are intentionally static,
restricted mimics. They show the learner what each app workspace feels
like with sidebar navigation, coach/chat teaser, module cards, and locked
actions. They do not call AI APIs, record audio, submit answers, open
reading/listening content, score simulator questions, or persist progress.
The current overview routes are:

- `/overview/nihongo`: Ai-chan/Japanese learning teaser.
- `/overview/english`: John/interview and CEFR teaser.
- `/overview/arabic`: Saudi daily Arabic roleplay teaser.
- `/overview/pmp`: Andromeda/PMP readiness and simulator teaser.

The overview cards on the landing page link directly to these routes so
prospective users can try the shape of the app before subscribing without
receiving full product access.

## Lesson Cache Backend

AI lesson cache is stored per lesson and template variant. Each lesson can have up to three cached templates. The start AI lesson route checks existing cached templates first. If fewer than three templates exist, a new template may be generated and saved. If three templates already exist, one is selected from the database. This avoids repeated OpenAI generation for the same lesson while still allowing content variety.

Admin lesson cache visibility is available from `/admin/lesson-cache`, including cache count per lesson and missing-cache awareness.

## Reading Backend

Reading Practice uses `ReadingPassage` records:

- `sourceType = CACHED`: database-seeded or admin-managed reading content.
- `sourceType = AI_GENERATED`: future paid personalized reading content.

Trial users receive cached records only. Paid/admin users can use cached reading and later AI-personalized reading. This keeps trial costs predictable and preserves a database-first reading experience.

## Recording Backend

English interview recording uses MediaRecorder in the browser, converts the audio blob to `FormData`, and posts it to the backend. The backend validates the session and stores recording metadata on the answer record, including audio URL/reference, duration, status, review status, and timestamps.

The user flow keeps the existing behavior:

- after submit, the user sees a recorded state;
- the user can record again;
- future submissions use the current replacement/update behavior for the active user/question view;
- historical duplicate records remain visible to admin for audit and review context.

Admin recording review is available at `/admin/recordings`, grouped by user and interview question. The newest submission is marked `Latest`, and older submissions stay visible with timestamps and playback controls.

## Billing Backend

Billing has moved from manual-payment-first UAT flow toward a
Midtrans-centered checkout flow while retaining historical manual payment
records for audit compatibility:

- user selects a plan;
- invoice/payment record is created;
- the user continues payment through the configured official payment
  gateway flow when checkout is open;
- gateway transaction identifiers, status, and response snapshots are
  stored for admin review;
- subscription is activated or extended.

Payment states:

- `PENDING`
- `WAITING_VERIFICATION`
- `PAID`
- `REJECTED`
- `EXPIRED`

Subscription states:

- `TRIAL`
- `ACTIVE`
- `EXPIRED`
- `CANCELED`

Pricing, promo controls, sandbox payment-gateway visibility, and checkout copy
are not hardcoded in the UI. They are stored as `PlatformSetting` records
and managed from admin surfaces. The user billing page reads the same
settings through shared helpers.

Admin pricing input is business-facing rupiah. The database still stores
`priceCents` for existing payment compatibility, but admin forms and docs must
not ask operators to enter cents. Fixed billing periods are coupled to their
durations: `MONTHLY` is 30 days, `QUARTERLY` is 90 days, and `YEARLY` is 365
days. Public `/checkout` must list all active plans, not only monthly plans, so
quarterly/yearly configuration cannot hide order items. The plan catalog
self-heals canonical rows for every learning app: Monthly, Quarterly, and
Yearly are separate plan records. Admin Settings locks each row's period and
duration so operators cannot accidentally turn the monthly row into a quarterly
row and then have catalog repair set it back.

Payment-provider secrets are environment variables only. They must not be
printed in release notes, architecture docs, screenshots, or client-side
code. Public user-facing payment copy should stay channel-focused
(`QRIS`, `Virtual Account`, `E-Wallet`, retail payment) while
provider-specific implementation detail belongs in Admin Console.

Midtrans production mode is controlled by deployment runtime, not by admin UI:

- Vercel production deployments use production Midtrans mode automatically.
- Production checkout is always open when the production server key exists.
- Admin Console controls only sandbox checkout open/closed state for UAT.
- When sandbox checkout is enabled, user billing shows an additional
  `Lanjut bayar (sandbox)` action. When sandbox checkout is disabled, user
  billing shows only the production `Lanjut bayar` action in production.
- Webhooks verify against the transaction's stored `midtransMode` whenever it
  exists, so historical sandbox transactions continue to validate after a live
  gateway is configured.
- Server keys and merchant credentials must be added manually to Vercel
  Environment Variables; never store them in `PlatformSetting`.
- Midtrans Finish Redirect URL is `/payment/finish`. The page is public,
  preserves authenticated browser state, and links back to billing, dashboard,
  and Academy Home.

Authenticated navigation should preserve login state. Public Academy links from
`/login`, `/platform/dashboard`, and platform navigation are ordinary links, not
logout actions. Sessions use a 4-hour idle timeout enforced by the server-side
single-session record and by a client idle timer on protected shells.

## Transactional Email

Registration validates email format on both client and server, normalizes
addresses before user creation, and can send a confirmation email after a
successful registration. The mailer is SMTP-based and configured with
environment variables:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `EMAIL_FROM`
- `EMAIL_REPLY_TO`

When SMTP is not configured, registration still succeeds and the app logs
that confirmation email was skipped. Credentials are never committed.

## Admin UI Architecture

The Operations Console lives under `/admin`. It is separate from `/platform/admin`, which remains the legacy access-control page. Admin discoverability is provided by platform sidebar links for admins.

Current admin pages:

- `/admin/users`: users, role, access, and subscription overview.
- `/admin/subscriptions`: active/trial/expired subscription visibility.
- `/admin/payments`: manual payment verification workflow.
- `/platform/admin/promos`: reusable promo campaign management for
  editable campaign copy and status.
- `/admin/usage`: feature usage and AI usage visibility.
- `/admin/lessons`: curriculum lesson visibility.
- `/admin/lesson-cache`: AI lesson template cache counts.
- `/admin/readings`: reading cache visibility.
- `/admin/flashcards`: flashcard content visibility.
- `/admin/quizzes`: quiz content visibility.
- `/admin/recordings`: English/Nihongo recording review grouped by user and question.
- `/admin/settings`: pricing, plan, QRIS, and bank transfer configuration.
- `/admin/architecture`: this architecture document.

Reusable admin UI pieces live in `components/admin`. Admin pages should keep data loading server-side when possible and use client components only for forms/actions that need browser interactivity.

The payment admin surface groups transaction history by month for easier
review and surfaces payment-gateway status in a compact transaction-log
style. Admin payment controls should favor configuration and audit
visibility over manual state buttons when the gateway is the source of
truth.

## UI Architecture

The platform shell provides global navigation, admin-only links, mobile drawer behavior, and footer branding. The app shell for Nihongo keeps the app experience focused while using shared layout utilities where appropriate.

Responsive behavior:

- desktop: sidebar is visible;
- mobile: hamburger opens a drawer with overlay and close button;
- footer displays Nexus Platform branding and copyright.

Interactive browser APIs live in client components:

- `PronunciationRecorder` handles assessment recording states and microphone permission errors.
- `EnglishInterviewClient` handles English interview recording, upload, recorded state, and retry flow.
- `ManualBillingClient` handles plan selection, proof upload, and payment status UI.
- `AdminSettingsClient` handles pricing and payment information settings.

Brand metadata:

- Root metadata uses `/nexus-ai-logo.png` for favicon and Apple touch icon.

## Nexus Kingdoms Game

Nexus Kingdoms supports cross-continent discovery and attacks. Target scouting
must not be limited to the current continent or to a tiny preview slice. The
game target API prioritizes kingdoms that recently attacked the current user,
then lists kingdoms from all continents so retaliation stays visible and the
battle loop remains fun. Incoming attack notifications include a direct
`Serang balik` action.

## Deployment And Operations

The project deploys to Vercel as a Next.js app. Production database compatibility is supported by production-safe seed checks that create missing platform tables before seed upserts when older deployments do not yet have the newest schema. Prisma remains the schema source of truth; migration discipline should be tightened before scale.

Local build behavior is intentionally resilient for UAT. The `npm run build` script now checks whether `DATABASE_URL` is reachable. If the database is reachable, it runs Prisma migration and seed before building. If the database is not reachable, it skips migration/seed and still runs Prisma generate plus Next production build. Use `npm run build:strict` when a database-backed build must fail on migration or seed errors.

Production seed safety: every Vercel production build runs `npx prisma db seed` after Prisma migration. To keep this safe, every seed file that touches data also visible to end users must be idempotent and non-destructive — use `upsert` keyed by stable identifiers (slug, key) and avoid `deleteMany` followed by `createMany`, because the IDs change on every deploy and any user-modified row gets overwritten. Curriculum lessons use `upsert` keyed by `slug` or `order`, admin app access is reconciled to `NON_EXPIRING` with `accessExpiresAt = null`, and platform settings/subscription plans use `upsert` keyed by `key`/`code`. Direct `vercel --prod` uploads bypass git history and have caused source-of-truth drift; production deploys should always go through `git push` to `main`.

Payment deployment safety: before aliasing `nexustalenta-academy.com`, inspect
the candidate deployment and current alias owner. Verify the candidate URL
directly for `/checkout`, `/api/auth/csrf`, and Midtrans sandbox Snap creation.
Local `.env` files are excluded through `.vercelignore`; this must stay in
place so local-only database URLs cannot be uploaded during an emergency direct
deploy.

Operational expectations:

- run Prisma generation after schema updates;
- run database push or migrations before production deploys when schema changes are included;
- seed platform settings and cached reading content when provisioning a new environment;
- verify protected routes as both admin and non-admin users;
- deploy to production exclusively via `git push origin main` to keep git as the single source of truth and avoid divergence between deployed code and committed code;
- when a hotfix or rollback is needed, use `vercel rollback <previous-deployment-url>` to restore service while the fix is prepared, then promote the corrected deployment with `vercel promote` once verified.

## Current Technical Debt

- Manual payment proof storage currently depends on the available storage/file-reference strategy and should be upgraded to durable object storage before large usage.
- Admin pages are intentionally functional and lightweight; richer filtering/search can be added as data volume grows.
- Trial limits are implemented in shared guards, but every new feature should explicitly call a guard before cost-bearing work.
- AI-generated reading for paid users is architected but should be expanded with persistence, review tooling, and cost tracking before broad release.
