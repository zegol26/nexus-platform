# Nexus Platform / Nexus AI Nihongo Architecture

Last updated: 2026-05-03

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
- `app/apps/nihongo/*`: Nexus AI Nihongo user experience, including curriculum, AI lesson, flashcards, tutor, reading, listening, and assessments.
- `app/apps/english/*`: Nexus AI English interview flow and user recording submission experience.
- `app/admin/*`: Operations Console for ADMIN users only. This area is intentionally hidden from non-admin navigation and protected by server-side admin checks.
- `app/api/platform/*`: platform APIs for billing, payment proof upload, and admin payment verification.
- `app/api/apps/*`: app-specific APIs for Nihongo and English features.
- `components/layout/*`: shared shell pieces such as sidebar drawer and global footer.
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

Billing is MVP manual-payment first:

- user selects a plan;
- invoice/payment record is created;
- user uploads proof;
- admin verifies payment;
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

Pricing, QRIS information, and bank account information are not hardcoded in the UI. They are stored as `PlatformSetting` records and managed from `/admin/settings`. The user billing page reads the same settings through shared helpers.

Rejected payments are final from the admin action UI perspective: verify and reject actions are disabled for rejected records.

## Admin UI Architecture

The Operations Console lives under `/admin`. It is separate from `/platform/admin`, which remains the legacy access-control page. Admin discoverability is provided by platform sidebar links for admins.

Current admin pages:

- `/admin/users`: users, role, access, and subscription overview.
- `/admin/subscriptions`: active/trial/expired subscription visibility.
- `/admin/payments`: manual payment verification workflow.
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

## Deployment And Operations

The project deploys to Vercel as a Next.js app. Production database compatibility is supported by production-safe seed checks that create missing platform tables before seed upserts when older deployments do not yet have the newest schema. Prisma remains the schema source of truth; migration discipline should be tightened before scale.

Local build behavior is intentionally resilient for UAT. The `npm run build` script now checks whether `DATABASE_URL` is reachable. If the database is reachable, it runs Prisma migration and seed before building. If the database is not reachable, it skips migration/seed and still runs Prisma generate plus Next production build. Use `npm run build:strict` when a database-backed build must fail on migration or seed errors.

Operational expectations:

- run Prisma generation after schema updates;
- run database push or migrations before production deploys when schema changes are included;
- seed platform settings and cached reading content when provisioning a new environment;
- verify protected routes as both admin and non-admin users.

## Current Technical Debt

- Manual payment proof storage currently depends on the available storage/file-reference strategy and should be upgraded to durable object storage before large usage.
- Admin pages are intentionally functional and lightweight; richer filtering/search can be added as data volume grows.
- Trial limits are implemented in shared guards, but every new feature should explicitly call a guard before cost-bearing work.
- AI-generated reading for paid users is architected but should be expanded with persistence, review tooling, and cost tracking before broad release.
