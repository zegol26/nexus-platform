# Database

## Source Of Truth

`prisma/schema.prisma` is the source of truth for database shape. The datasource is PostgreSQL and Prisma Client uses `@prisma/adapter-pg` through `lib/db/prisma.ts`.

## Major Model Groups

- Identity: `User`, `Account`, `Session`, `VerificationToken`.
- Platform/commercial: `PlatformApp`, `PlatformSetting`, `AppUserAccess`, `SubscriptionPlan`, `Subscription`, `PaymentTransaction`, `PaymentProof`, `AccessGrantAudit`.
- Nihongo: `NihongoLesson`, `NihongoCharacterContent`, `NihongoLessonProgress`, `NihongoFlashcard`, assessment, badge, mock test, lesson template/generated content, tutor message, listening asset.
- Reading/listening: `ReadingPassage` with `contentType` and `sourceType`.
- English: `EnglishInterviewQuestion`, `EnglishInterviewAnswer`, `EnglishInterviewReview`.
- Game/community: `UserGameProfile`, `GameKingdom`, resources, army units, battle logs, cards, daily counters, community rooms/messages/reactions.
- PMP: ITTO process/item, glossary, knowledge articles, AI feedback, brain dumps, lesson progress, readiness items.
- Analytics/observability: `AnalyticsEvent`, `FeatureUsage`, `ServerRouteMetric`.

## Migration Timeline

Recent migrations include:

- `20260508120000_battle_casualties_seen`
- `20260508140000_hero_selected_at`
- `20260520090000_add_pmp_learning`
- `20260520200000_add_pmp_feedback_progress`
- `20260521120000_usage_metrics_midtrans_plans`
- `20260521133000_rename_nihongo_academy`
- `20260521134500_restore_nihongo_app_name`

## Seed Policy

Seeds must be idempotent and production-safe. Use stable unique keys such as slug, source key, app code, or plan code. Do not use destructive `deleteMany()` + recreate behavior for user-visible data.

Production history includes a stale seed incident that removed lessons 41 and 42 and reset admin access. Every future seed touching user-visible data needs careful review.

## Build Behavior

`npm run build` checks database reachability. If reachable, it runs migrations; it only seeds when `RUN_SEED_ON_BUILD=true` or outside Vercel production. `npm run build:strict` always runs migrate, generate, seed, then build.

## Storage Notes

- Manual proof images currently persist as base64 data URLs in `PaymentProof.fileUrl`.
- Listening audio can persist as database data URLs for MVP.
- English interview answers store audio base64 and MIME metadata.
- These storage choices are stable for MVP but should move to durable object storage before high volume.
