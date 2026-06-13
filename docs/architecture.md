# Architecture

## System Overview

Nexus Platform is a Next.js 16 App Router monolith. It keeps platform concerns, app-specific learning surfaces, admin operations, and public commerce pages in one repository while separating code by route and domain folders.

## Route Map

- `app/page.tsx`: public academy landing page.
- `app/login`, `app/register`: authentication entry.
- `app/checkout`, `app/payment/finish`, `app/terms`, `app/refund-policy`, `app/contact`: public commerce/legal/payment-provider review surfaces.
- `app/overview/[app]`: public restricted app previews.
- `app/platform/*`: authenticated user shell: dashboard, programs, apps, billing, community, settings, game, legacy admin access page.
- `app/apps/nihongo/*`: Japanese learning workspace.
- `app/apps/english/*`: English interview, DCE, and John coach workspace.
- `app/apps/arabic/*`: Arabic learning workspace.
- `app/apps/pmp/*`: PMP exam prep workspace.
- `app/apps/lessons/*`: internal lesson engine, admin-only.
- `app/admin/*`: operations console, admin-only.
- `app/api/*`: route handlers for auth, app APIs, billing, voice, game, admin, analytics, community, and platform settings.

## Code Boundaries

- `components/apps/<app>`: app-specific interactive UI.
- `components/platform`: authenticated platform UI.
- `components/admin`: admin reusable UI.
- `components/layout`: shared shell pieces.
- `components/marketing`: public landing/overview UI.
- `lib/auth`: NextAuth, admin checks, single-session logic.
- `lib/platform`: app registry, access, billing, Midtrans, settings, pricing, plan catalog.
- `lib/nexus`: shared feature access/usage policy.
- `lib/<app>`: app-specific domain logic.
- `lib/game`, `components/game`, `components/nihongo/game`: Nexus Kingdoms logic and UI.
- `prisma`: schema, migrations, seed scripts, data files.

## Runtime Rules

- Prefer server components for data loading and protected pages.
- Use client components for browser APIs, forms, recording, local state, voice, and interactive dashboards.
- Validate auth and app access on the server before rendering protected data.
- Validate auth/role again in mutating route handlers.
- Admin UI is protected by `requireAdmin()` and should not leak via normal user navigation.
- All cost-bearing features must pass shared or app-specific access guards before calling AI providers.

## Authentication

NextAuth uses credentials auth, Prisma adapter, JWT sessions, a 4-hour max age, and a server-side single-session record. `lib/auth/single-session.ts` creates/touches/invalidates sessions. Client protected shells include idle logout handling.

## Billing And Access

Platform apps are registered in `lib/platform/app-registry.ts`. Access is stored in `AppUserAccess` and subscriptions/payments in `Subscription`, `SubscriptionPlan`, `PaymentTransaction`, and `PaymentProof`.

The plan catalog self-heals Monthly, Quarterly, and Yearly rows per active learning app. Admin settings use rupiah input while the database preserves `priceCents`.

## AI Services

OpenAI powers tutors, roleplay, content generation, speech-to-text, and TTS fallback. ElevenLabs is optional for preferred TTS voices. AI tutor prompts are scoped to learning domains and should refuse unrelated general assistant tasks.

## Observability

`ServerRouteMetric` and `lib/observability/route-metrics.ts` support lightweight route metering for Fluid CPU risk. `/admin/usage` exposes sampled route usage and high-risk route visibility.

## Documentation Note

`app/admin/architecture/NEXUS_ARCHITECTURE.md` and `app/admin/architecture/RELEASE_NOTES.md` are still read by `/admin/architecture`. Keep them updated or intentionally link them to canonical docs if the admin page is refactored later.
