# Nexus Platform Agent Handbook

This is the first file future AI agents must read before changing code.

## Required Reading Order

1. Read this `AGENTS.md`.
2. Read `docs/project-state.md`.
3. Read `tasks/current-sprint.md`.
4. Read `docs/known-issues.md`.
5. Read the relevant domain doc from `docs/index.md`.
6. Inspect the code before editing; do not rely on memory alone.
7. If business/product decisions are involved, read `skills/nexus-business-context.md`.

## Skill Loading Protocol

Before starting any task:

1. Analyze request.
2. Identify required skills.
3. Load matching files from /skills.
4. Read all relevant skills.
5. Then implement.

Examples:

Task: Midtrans QRIS
Load:
- subscription-billing.md
- nextjs.md
- prisma.md

Task: SEO
Load:
- seo.md
- nextjs.md
- vercel.md

Task: AI Tutor
Load:
- ai-tutor.md
- openai.md
- prisma.md

## Product Vision

Nexus Platform is the parent learning and commerce platform for Nexus Talenta Indonesia Academy. It handles authentication, app access, billing, admin operations, public marketing/checkout surfaces, and shared navigation for a family of AI-assisted learning apps.

The platform should feel credible enough for payment-provider review and daily learner use: clear public product pages, reliable checkout, guarded paid features, admin visibility, and focused app workspaces.

## Ecosystem

- Nexus Platform: parent shell, account, billing, community, Nexus Kingdoms game entry, admin console, public academy pages, checkout, legal/contact pages.
- Nexus AI Nihongo: Japanese learning app for Indonesian learners with curriculum, AI tutor, voice, reading, listening, flashcards, quizzes, JLPT mock tests, assessment, badges, and Nexus Kingdoms rewards.
- Nexus AI English: English interview practice, Dynamic Conversational English curriculum, and John AI conversation coach.
- Nexus AI Arabic: Arabic curriculum, tutor, conversation, quiz, and progress surfaces for daily/work/umrah/travel contexts.
- PMP Exam Prep: PMP lessons, diagnostic, simulator, ITTO, glossary, knowledge base, readiness, brain dump, and Andromeda AI instructor.
- Future apps must plug into the shared platform access, billing, analytics, and admin conventions instead of inventing parallel systems.

## Technology Stack

- Next.js 16 App Router, React 19, TypeScript 5.
- Prisma 7 with PostgreSQL through `@prisma/adapter-pg`.
- NextAuth v4 credentials auth with Prisma adapter and JWT sessions.
- OpenAI SDK for AI tutor, generation, transcription, and TTS fallback.
- ElevenLabs optional TTS provider for voice features.
- Midtrans for payment gateway integration.
- Nodemailer SMTP for optional registration confirmation emails.
- Vercel for deployment, Fluid Compute-aware database pooling, and environment variable management.
- Tailwind CSS v4 utility styling with route-specific design systems.

## Architecture Rules

- Server components are the default. Use client components only for browser APIs, local interactive state, forms, recording, voice, or rich UI behavior.
- Protected pages must validate the session server-side. Mutating route handlers must validate session/role again.
- Admin operations live under `/admin` and use `requireAdmin()`. `/platform/admin` is a legacy access-control area and should not become the main admin console.
- App-specific code belongs under `app/apps/<app>`, `components/apps/<app>`, and `lib/<app>` when possible.
- Shared platform concerns belong under `lib/platform`, `lib/nexus`, `lib/auth`, `components/platform`, and `components/layout`.
- Do not bypass access guards for paid or cost-bearing features. Reuse `lib/nexus/access-guards.ts`, app-specific guards, and `FeatureUsage`.
- Prisma schema is the database source of truth. Use migrations for schema changes and regenerate Prisma Client after schema edits.
- Seeds must be idempotent and non-destructive. Avoid `deleteMany()` on user-visible data.
- Payment provider secrets live only in environment variables. Never store server keys in `PlatformSetting`, docs, screenshots, or client code.
- Midtrans production mode is environment/deployment controlled; admin UI may only open or close sandbox UAT checkout.
- Public overview routes are restricted mimics. They must not call AI, record audio, score real attempts, unlock content, or persist progress.
- Nexus Kingdom target discovery must show all returned targets and prioritize recent attackers; do not reintroduce tiny target previews.
- For Next.js behavior, this repo uses a version newer than many training examples. Check local Next docs or existing patterns before changing framework APIs.

## Coding Rules

- Follow existing route/component boundaries before adding abstractions.
- Prefer pure policy helpers for billing/access/limits so behavior can be unit-tested.
- Keep user-facing Indonesian formal in learning surfaces: prefer "saya" and "Anda".
- Pair Japanese learning content with romaji and Indonesian translation where applicable.
- Keep Ai-chan and John scoped to language learning; tutors should refuse out-of-scope general assistant work and pivot back to practice.
- Use route-specific design docs before UI work:
  - `docs/DESIGN.md` for Nexus AI Nihongo.
  - `docs/coding-standards.md` for general project rules.
- Do not duplicate feature implementations. Check existing `lib`, route handlers, and docs before adding a new flow.
- Keep environment-specific behavior in config/env helpers rather than hardcoded page logic.

## Development Workflow

- Install: `npm install`
- Dev server: `npm run dev`
- Type check: `npx tsc --noEmit --pretty false`
- Lint: `npm run lint`
- Tests: `npm test`
- Build: `npm run build`
- Strict DB-backed build: `npm run build:strict`
- Game validation: `npm run validate:game`
- Community copy validation: `npm run validate:community`
- N5 rehearsal validation: `npm run validate:n5-rehearsal`
- English listening validation: `npm run sanity:english-listening`
- English question validation: `npm run sanity:english-questions`

Production deploys should go through `git push origin main` and Vercel, not ad hoc direct uploads. Before changing production aliases, verify the candidate deployment for `/checkout`, `/api/auth/csrf`, login, billing, and payment sandbox behavior.

## Current Sprint

See `tasks/current-sprint.md`. Current focus is documentation consolidation and then payment/session/analytics follow-up work from the roadmap.

## Known Issues

See `docs/known-issues.md` and `tasks/blockers.md`. High-risk areas include payment deployment safety, mobile recording compatibility, storage choices for media/proofs, and seed/deploy discipline.

## AI Instructions

Future AI agents must preserve architecture consistency, protect historical decisions, avoid feature duplication, and update docs when behavior changes. If a change affects product state, deployment, database, access control, billing, AI usage, or known issues, update the relevant file in `docs/` or `tasks/` in the same work session.
