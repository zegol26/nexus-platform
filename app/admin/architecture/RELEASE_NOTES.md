# Release Notes

## Revision History

| Release Note | Date/Time (JST) | Author | Status | Summary |
| --- | --- | --- | --- | --- |
| RN-2026.05.05-002 | 2026-05-05 10:20 +09:00 | Nexus Platform Team | Completed | Fixed first-time Nexus Kingdom loading and refreshed Community Board UI. |
| RN-2026.05.05-001 | 2026-05-05 09:30 +09:00 | Nexus Platform Team | Completed | Hotfixed admin app access to be non-expiring and cleaned unsafe long expiry dates. |
| RN-2026.05.04-004 | 2026-05-04 22:45 +09:00 | Nexus Platform Team | Completed | Added platform/app Game pages for Nexus Kingdoms: Nihongo Realms and admin authority controls for Community. |
| RN-2026.05.04-003 | 2026-05-04 20:05 +09:00 | Nexus Platform Team | Completed | Added Nexus Kingdom gamification MVP and Listening module with admin audio upload management. |
| RN-2026.05.04-002 | 2026-05-04 01:45 +09:00 | Nexus Platform Team | Completed | Replaced Reading page with N5 to N4 Reading Skill Roadmap and seeded article detail experience. |
| RN-2026.05.04-001 | 2026-05-04 01:10 +09:00 | Nexus Platform Team | Completed | Fixed character foundation lesson access and verified kana/kanji grids in localhost. |
| RN-2026.05.03-002 | 2026-05-03 23:45 +09:00 | Nexus Platform Team | Completed | Added seedable Nihongo character content for kana, kanji, and vocabulary compounds, linked to lesson pages. |
| RN-2026.05.03-001 | 2026-05-03 23:09 +09:00 | Nexus Platform Team | Release Candidate | Admin Operations Console, billing/trial foundation, recording visibility, architecture docs, and Ai-chan assistant foundation. |

## RN-2026.05.05-002

Completed Nexus Kingdom load fix and Community Board UI refresh.

### Included Changes

- Fixed a race condition in `/api/game/me` where first-time users could trigger parallel kingdom creation.
- Made `getOrCreateGameKingdom` resilient to unique-key create races.
- Added safer JSON error response handling for game dashboard loading.
- Renamed the community hero title to “Komunitas Board”.
- Reworked the community layout into a high-contrast futuristic board with compact topic navigation.
- Moved information and rules directly under the hero.
- Condensed information and rule cards into contrast-highlighted Do and Don&apos;t sections.
- Reduced oversized typography and tightened chat/message spacing for better engagement density.

### Verification

- `npx tsc --noEmit`: passed.
- `npm run validate:community`: passed.
- `npm run validate:game`: passed.
- `npm run build`: passed.

### Known Notes

- Community remains polling-based for MVP; real-time updates can be added later.

## RN-2026.05.05-001

Completed Admin Non-Expiring Access Hotfix.

### Included Changes

- Converted admin and super admin app access to non-expiring access by storing `accessExpiresAt = null`.
- Updated seed behavior so seeded admin app access is always `billingPlan = ADMIN` and `billingPeriod = NON_EXPIRING`.
- Updated admin grant API to force non-expiring access for admin/super admin users.
- Clamped normal user admin grants to a maximum of 3650 days to avoid unsafe long-date edge cases.
- Added a migration cleanup for existing admin app access rows that were previously set to very long expiry dates.
- Updated Admin Access Control helper text to explain non-expiring admin access.

### Verification

- `npx prisma migrate deploy`: passed.
- `npx prisma generate`: passed.
- `npx tsc --noEmit`: passed.
- `npm run validate:community`: passed.
- `npm run validate:game`: passed.
- `npm run lint`: passed with existing `<img>` optimization warnings only.
- `npm run build`: passed.
- Production deploy: passed, aliased to `https://nexus-platform-ai.vercel.app`.

### Known Notes

- Non-admin users still use duration-based app access grants.
- A future explicit “permanent non-admin grant” option can be added without overloading duration days.

## RN-2026.05.04-004

Completed Community Admin Authority and Nexus Kingdoms: Nihongo Realms game expansion.

### Included Changes

- Added platform Game menu item and `/platform/game` kingdom dashboard.
- Added Nihongo Game menu item and `/apps/nihongo/game` battle-training dashboard.
- Added `GameKingdom`, `GameResourceLedger`, `GameArmyUnit`, `GameBattleLog`, `GameUserCard`, and `GameLearningRewardDailyCounter`.
- Added continent assignment logic that fills each continent to 10 users before moving to the next continent, then balances by lowest population.
- Added resource conversion, troop training, castle upgrade, target scouting, battle execution, leaderboard, deck preview, and battle log APIs.
- Synced new kingdom reward ledger with lesson completion, reading completion, listening completion, JLPT N5 mock completion, flashcard correct, and quiz correct flows.
- Added admin-only Community room/message delete APIs and UI controls.
- Allowed admin users to create Community rooms regardless of Flashcard Spark eligibility.

### Verification

- `npx prisma migrate deploy`: passed.
- `npx prisma generate`: passed.
- `npx tsc --noEmit`: passed.
- `npm run validate:community`: passed.
- `npm run validate:game`: passed.
- `npm run lint`: passed with existing `<img>` optimization warnings only.
- `npm run build`: passed.

### Known Notes

- Battle is an MVP turn-based simulation with deterministic variance stored in battle snapshots.
- Deck cards are present for earning/display; advanced card effects are reserved for the next game iteration.
- Admin Community authority is intentionally broad for MVP moderation control.

## RN-2026.05.04-003

Completed Nexus Kingdom Gamification MVP and Listening Module + Admin Audio Upload Management.

### Included Changes

- Added `UserGameProfile` with XP, build points, coins, daily XP cap, activity counters, and achievement storage.
- Added `lib/gamification/kingdom.ts` with reward calculation, castle level/stage formula, progress-to-next-level, achievements, and daily cap enforcement.
- Added `/api/apps/nihongo/game/profile` and `/api/apps/nihongo/game/reward`.
- Added animated `CastleVisual`, `KingdomCard`, and `AchievementGrid` and embedded Nexus Kingdom into the platform dashboard.
- Extended `ReadingPassage` with `contentType`, audio metadata, and transcript JSON fields so Listening can reuse the Reading content table.
- Added `/apps/nihongo/listening` and `/apps/nihongo/listening/[id]` with roadmap cards, audio player, transcript, Romaji toggle, Indonesian toggle, and completion tracking.
- Added `/admin/listening` plus protected upload/delete APIs for admin audio + JSON metadata management.
- Updated Reading filters so Reading pages/admin only show `contentType = READING`.
- Wired rewards into Lesson Complete, Reading Complete, Listening Complete, Quiz Correct, Flashcard Correct, and JLPT N5 Mock Test Correct flows.

### Verification

- `npx prisma migrate deploy`: passed.
- `npx prisma generate`: passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed.
- `npm run lint`: passed with existing `<img>` optimization warnings only.
- `npm run test`: passed with 6 tests.

### Known Notes

- Listening audio is stored as a database data URL in this MVP to avoid adding a new storage provider; migrate to Blob/S3-compatible storage for larger audio libraries.
- Flashcard and quiz reward calls are client-triggered MVP hooks; later hardening should validate attempts server-side before awarding rewards.

## RN-2026.05.04-002

Completed Reading Roadmap Upgrade for Nexus AI Nihongo.

### Included Changes

- Replaced legacy `/apps/nihongo/reading` generator UI with Reading Skill Roadmap experience.
- Added N5 to N4 progression path with completion state, current node state, locked future state, and avatar progress marker.
- Added article detail route under `/apps/nihongo/reading/[slug]` with Japanese text, Romaji toggle, Indonesian translation toggle, completion button, and previous/next navigation.
- Added `prisma/data/nihongo-reading-articles.fixed.json` and `prisma/seed-reading-articles.ts`.
- Reused existing `ReadingPassage` and `AnalyticsEvent` models; no Prisma schema migration was required.
- Added `/apps/nihongo/assessment` compatibility redirect to existing pre-assessment flow for route regression coverage.

### Verification

- `npx tsx prisma/seed-reading-articles.ts`: passed; inserted 20 N5 and 20 N4 articles on first run.
- `npx tsc --noEmit`: passed.
- `npm run lint`: passed with existing `<img>` optimization warnings only.
- `npm run build`: passed.
- `npm run test`: passed with 6 tests.
- Browser verified `/apps/nihongo/reading` loads the roadmap.
- Browser verified `/apps/nihongo/reading/n5-01-gakkou-made-no-nagai-michi` opens article detail.
- Browser verified Romaji and Indonesian toggles.
- Browser verified Mark Complete updates progress to `1/40` and `3%`.
- Browser verified previous/next article navigation.
- Browser verified mobile-width layout.

### Known Notes

- Reading completion is tracked via `AnalyticsEvent` rather than a dedicated progress table to avoid a schema change.
- The legacy generated reading API remains available, but the primary route now presents seeded roadmap content.

## RN-2026.05.04-001

Completed localhost validation and access correction for Nihongo character foundation lessons.

### Included Changes

- Allowed `hiragana-foundation`, `katakana-foundation`, `kanji-n5-foundation`, and `kanji-n4-foundation` to bypass the trial lesson order limit as foundation character content.
- Updated curriculum API access decisions so lesson cards for character foundation lessons are marked accessible.
- Updated lesson detail API access decisions so lessons 41 and 42 no longer return trial-limit `403` for character content pages.
- Updated curriculum links to prefer stable lesson slugs when available.
- Changed curriculum seeding from delete/recreate to update-or-create behavior so lesson IDs are no longer regenerated on every build/seed.
- Improved lesson detail error fallback so access errors are shown as their actual message instead of incorrectly showing `Lesson tidak ditemukan`.

### Verification

- Browser verified Hiragana Foundation displays `Hiragana Grid` with 46 items.
- Browser verified Katakana Foundation displays `Katakana Grid` with 46 items.
- Browser verified lesson 41 displays `N5 Kanji Cards` with 162 items.
- Browser verified lesson 42 displays `N4 Kanji Cards` with 457 items.
- `npx tsc --noEmit`: passed.
- `npm run lint`: passed with existing `<img>` optimization warnings only.

## RN-2026.05.03-002

Completed character content foundation for Nexus AI Nihongo lessons.

### Included Changes

- Added `NihongoCharacterContent` Prisma model with unique protection on `type + level + char`.
- Added nullable `NihongoLesson.slug` for stable lesson-to-content mapping.
- Added cleaned seed data at `prisma/data/nihongo-character-content.json` using one root object and seed version `nihongo-character-content-v1`.
- Normalized pasted kana/kanji data into `hiragana`, `katakana`, `kanji`, and `vocabulary` character sets.
- Mapped hiragana to `hiragana-foundation`, katakana to `katakana-foundation`, N5 kanji/vocabulary to `kanji-n5-foundation`, and N4 kanji/vocabulary to `kanji-n4-foundation`.
- Removed duplicates by `type + level + char` during data generation.
- Added `prisma/seed-character-content.ts` with idempotent upsert behavior and insert/update logging by type and level.
- Updated lesson detail API to return character content from PostgreSQL.
- Updated lesson detail UI to show responsive kana grids, kanji cards, vocabulary compound cards, and empty states.

### Verification

- `npx prisma generate`: passed.
- `npx prisma migrate dev --name add_nihongo_character_content`: blocked by pre-existing local migration drift and Prisma requested reset; reset was not run.
- `npx prisma migrate deploy`: passed and applied `20260503150000_add_nihongo_character_content`.
- `npx tsx prisma/seed-character-content.ts`: passed.
- Seed result: 46 hiragana, 46 katakana, 142 N5 kanji, 418 N4 kanji, 20 N5 vocabulary compounds, and 39 N4 vocabulary compounds.

### Known Notes

- The source paste file remains outside the repo at `C:\Users\user\Documents\kana kanji.txt`; the repo now uses the cleaned JSON in `prisma/data`.
- PowerShell may display Japanese as mojibake depending on terminal encoding, but Node/Prisma read the JSON as valid UTF-8.

## RN-2026.05.03-001

Release candidate for Nexus Platform operations readiness.

### Gate Results

- Test suite: passed. `npm test` completed 6 focused unit/function tests.
- TypeScript: passed. `npx tsc --noEmit` completed with no errors.
- Lint: passed. `npm run lint` completed with existing `<img>` optimization warnings only.
- Local production build: passed. `npm run build` completed successfully.
- Vercel approval: completed.
- Vercel deployment: completed.
- Production loaded check: completed. `/login` returned HTTP 200 on the production alias.

### Included Changes

- Added Admin Architecture page at `/admin/architecture`.
- Added codebase architecture markdown under the Admin Architecture folder.
- Added release notes markdown under the Admin Architecture folder.
- Added Release Notes and Architecture accordions to the Admin Architecture page.
- Added pure helper policies for access limits, lesson cache variant selection, billing settings, payment actions, and recording grouping.
- Added function/unit tests for trial limits, cached reading policy, lesson cache variants, payment action disablement, billing settings mapping, and admin recording grouping.
- Updated local build behavior so UAT build can complete even when local Postgres is not running.
- Preserved strict DB-backed build command as `npm run build:strict`.
- Added Ai-chan assistant foundation for platform and app pages, including session-protected reminder context, priority reminder engine, floating widget UI, and Bahasa Indonesia assistant copy.

### Known Warnings

- ESLint reports existing Next image optimization warnings for `<img>` usage in current UI files.
- Local migration and seed are skipped by `npm run build` when `DATABASE_URL` is empty, invalid, or unreachable.
- `npm run build:strict` remains available when migration and seed must be mandatory.
- Localhost pages that query Prisma require a reachable `DATABASE_URL`; otherwise Prisma returns `ECONNREFUSED`.

### Pending Release Steps

- Continue UAT on production alias.
- Validate authenticated admin access to `/admin/architecture`, `/admin/users`, `/admin/payments`, and `/admin/recordings`.
- Validate Ai-chan on authenticated platform and app pages with real user billing, trial, study, and activity states.
- Validate English recording playback on desktop before starting the mobile recording compatibility improvement.

### Deployment Result

- Production alias: `https://nexus-platform-ai.vercel.app`
- Vercel ready state: `READY` on the checked production deployment.
- Error log scan: clean, no recent error logs found.

## Next Improvement Plan

### 1. Mobile Recording Compatibility

Goal: make English interview recording reliable on iPhone Safari, Android Chrome, and desktop fallback browsers.

- Add an explicit microphone capability check before recording starts.
- Detect unavailable `navigator.mediaDevices`, blocked permissions, unsupported secure context, and denied device access before showing the recorder UI.
- Improve iOS Safari and Chrome mobile messaging when the browser cannot trigger the native microphone popup.
- Guide users to enable microphone access in device/browser settings when permission is blocked outside the web prompt.
- Normalize recording MIME type fallback by browser support, prioritizing browser-compatible options such as `audio/mp4`, `audio/webm`, or another supported `MediaRecorder` type.
- Store the selected MIME type with each recording so playback and review endpoints can serve the correct format.
- Fix mobile playback by serving audio with correct `Content-Type`, `Accept-Ranges`, and a browser-compatible source format where possible.
- Add manual QA coverage for iPhone Safari, iPhone Chrome, Android Chrome, desktop Chrome, and desktop Edge.

### 2. Single Active Session

Goal: keep each non-admin account limited to one active login session.

- Use the existing NextAuth `Session` model as the source of truth for active sessions.
- On login, invalidate older sessions for the same `userId`.
- Keep one active session per user by default.
- Allow an admin override later if operationally needed for support or testing.
- Add an optional admin session monitor page showing active session count, latest session creation time, and expiry time.
- Add audit visibility for forced session invalidation if this becomes part of admin operations.

### 3. Analytics From Current Database

Goal: create an admin analytics layer using the current Prisma schema before adding external analytics services.

- User growth: new users by day/week and role split.
- Trial/funnel: trial users, active users, expired access, and subscription conversion.
- Billing: pending/paid/rejected payments, payment proof review time, and revenue by plan/app.
- App access: active apps per user, expiring access, and access grant audit activity.
- Nihongo learning: lesson completion, completion rate by lesson/order/level, and stuck lessons.
- AI usage: tutor question counts via `FeatureUsage`, generated lesson content volume, and cached template coverage.
- Assessment: score distribution, weakness/strength tags, estimated level, and pronunciation score trends.
- Mock test: attempts, score percent, readiness pass rate, and wrong-answer hotspots.
- Reading: cached versus AI-generated passages and level/topic coverage.
- English interview: submissions by user/question, review status, score/level distribution, and reviewer throughput.
- Content operations: flashcard count by deck/level/category, quiz/question coverage, and lesson cache missing variants.

### 4. Ai-chan Assistant Evolution

Goal: turn Ai-chan from a contextual reminder widget into a cross-app companion.

- Add per-app custom reminders while preserving the global priority order.
- Add admin-configurable reminder copy and thresholds for payment, trial, inactivity, and study nudges.
- Add event tracking for reminder impressions, clicks, dismissals, and minimized state.
- Add richer reminder context for English interview submissions, pending review feedback, and stale payment proof status.
- Keep all Ai-chan user-facing copy in Bahasa Indonesia.
