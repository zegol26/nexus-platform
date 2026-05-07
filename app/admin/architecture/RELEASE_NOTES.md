# Release Notes

## Revision History

| Release Note | Date/Time (JST) | Author | Status | Summary |
| --- | --- | --- | --- | --- |
| RN-2026.05.07-001 | 2026-05-07 12:00 +09:00 | Nexus Platform Team | Completed | Added user-selectable theme toggle (Nexus / Squid / Rockstar) on the Nihongo header, scoped to the `/apps/nihongo` route only. Synthesized `docs/DESIGN.md` as the source of truth for the in-house Nexus design system. Fixed billing proof upload hang (Vercel filesystem write) by switching to base64 data URL storage with proper error handling. Fixed Listening Indonesian translation not rendering by making the parser tolerant of `indonesia` keys nested in either object or per-line array shapes. |
| RN-2026.05.06-003 | 2026-05-06 23:30 +09:00 | Nexus Platform Team | Completed | Repainted Nexus AI Nihongo with a dark + pink/teal Squid-Game-inspired theme using `[data-theme="squid"]` CSS overrides, swapped the Nihongo logo to `Nexustalenta.svg` with a glow treatment, and shrank the heading scale ~12-15% for tighter typography. |
| RN-2026.05.06-002 | 2026-05-06 22:00 +09:00 | Nexus Platform Team | Completed | Improved Nihongo and Platform sidebar UX (smaller width, active route highlighting, mobile drawer auto-closes on navigation), added engaging route loaders, normalized AI Tutor opening copy to formal "saya". |
| RN-2026.05.06-001 | 2026-05-06 18:15 +09:00 | Nexus Platform Team | Completed | Hotfixed production data loss caused by stale seed scripts on auto-deploy and synced local working tree to git as `prod-checkpoint-20260506`. |
| RN-2026.05.05-002 | 2026-05-05 10:20 +09:00 | Nexus Platform Team | Completed | Fixed first-time Nexus Kingdom loading and refreshed Community Board UI. |
| RN-2026.05.05-001 | 2026-05-05 09:30 +09:00 | Nexus Platform Team | Completed | Hotfixed admin app access to be non-expiring and cleaned unsafe long expiry dates. |
| RN-2026.05.04-004 | 2026-05-04 22:45 +09:00 | Nexus Platform Team | Completed | Added platform/app Game pages for Nexus Kingdoms: Nihongo Realms and admin authority controls for Community. |
| RN-2026.05.04-003 | 2026-05-04 20:05 +09:00 | Nexus Platform Team | Completed | Added Nexus Kingdom gamification MVP and Listening module with admin audio upload management. |
| RN-2026.05.04-002 | 2026-05-04 01:45 +09:00 | Nexus Platform Team | Completed | Replaced Reading page with N5 to N4 Reading Skill Roadmap and seeded article detail experience. |
| RN-2026.05.04-001 | 2026-05-04 01:10 +09:00 | Nexus Platform Team | Completed | Fixed character foundation lesson access and verified kana/kanji grids in localhost. |
| RN-2026.05.03-002 | 2026-05-03 23:45 +09:00 | Nexus Platform Team | Completed | Added seedable Nihongo character content for kana, kanji, and vocabulary compounds, linked to lesson pages. |
| RN-2026.05.03-001 | 2026-05-03 23:09 +09:00 | Nexus Platform Team | Release Candidate | Admin Operations Console, billing/trial foundation, recording visibility, architecture docs, and Ai-chan assistant foundation. |

## RN-2026.05.07-001

Completed Nexus AI Nihongo Theme Toggle, DESIGN.md, and Production Hotfixes.

### Background

Two production bugs landed alongside the multi-theme rollout:

1. Manual billing proof upload hung indefinitely on the loading
   spinner. Root cause: `/api/platform/billing/payments/[paymentId]/proof`
   wrote uploaded files to `public/uploads/payment-proofs/` via
   `fs/promises`. Vercel Functions cannot persist to the project
   filesystem outside `/tmp`, so the write threw silently. The route
   had no try/catch, so the response was a runtime 500 (HTML body),
   and the client called `await response.json()` without error
   handling — the parse rejection was unhandled and the
   `setLoading(false)` never fired.

2. Nexus AI Nihongo Listening pages showed romaji correctly but the
   Indonesian translation toggle stayed blank. Root cause: the
   parser at `lib/nihongo/listening.ts` only checked
   `passage.translationJson` for a parallel string array. Several
   admin uploads in production were stored either as
   `{ indonesia: [...] }` objects or as per-line arrays
   (`[{ japanese, romaji, indonesia }]`), so the direct array read
   came back empty and the UI rendered nothing.

### Included Changes

- Replaced `next-themes` with a minimal in-house React Context
  (`NihongoThemeProvider`) that persists the chosen theme in
  `localStorage` under `nihongo-theme`. `next-themes` injects an
  inline `<script>` for first-paint hydration which Next.js 16
  flags with a console warning when the provider is nested below
  the root layout — the in-house provider has no script and lives
  inside the Nihongo layout so the theme attribute never leaks to
  `/platform` or `/admin`.
- Added `NihongoThemeShell` to apply the chosen theme as a
  `data-theme` attribute on a wrapper div, and `NihongoThemeToggle`
  as a 3-state segmented control (`✦ NX` / `○ SQ` / `★ RS`) sitting
  in the Nihongo header next to the logout button.
- Synthesized `docs/DESIGN.md` (~600 lines) as the in-house Nexus
  design system. Drew warm AI-tutor language from Claude,
  conversational chat patterns from Intercom, structured
  curriculum surfaces from Notion, dark cinematic Voice/Listening
  surfaces from ElevenLabs, and the cream + yellow analytics
  surface for `/admin/analytics` from PostHog. No brand identity
  is copied verbatim — the result is a unique sumi-cream + persimmon
  CTA + Japanese accent family palette.
- Implemented the `[data-theme="nexus"]` (default) override block
  alongside the existing `[data-theme="squid"]` and
  `[data-theme="rockstar"]` blocks in `app/globals.css`. Each block
  translates the same Tailwind utility classes (slate / cyan / blue)
  into theme-appropriate colours, so the runtime palette switches
  without editing any component.
- Added scoped fixes for known contrast issues:
  - Squid: `bg-slate-950` (the project's primary-dark-CTA convention)
    flips to brand pink `#ED1A7F` so primary actions pop instead of
    disappearing into the dark canvas. Text steps audited for AA on
    the dark surface family.
  - Rockstar: `bg-slate-950` flips to brand yellow `#FCAF17` with
    black text. Inside that yellow surface, `text-slate-300` /
    `bg-cyan-300` / `bg-white/10` are flipped to dark variants via
    descendant selectors so the Progress panel stays legible.
- Made `NihongoSidebar` decorations theme-aware: number markers in
  Nexus, ○ △ □ rotation in Squid, ★ stars in Rockstar; faint corner
  watermark shapes only in the dark themes. Logo + active-item glow
  per theme via CSS rules on `aside` and `nav a[aria-current]`.
- Hot-fixed `/api/platform/billing/payments/[paymentId]/proof` to
  encode the uploaded proof as a base64 data URL and store it
  directly in `PaymentProof.fileUrl`. Wrapped the handler in
  try/catch with a JSON 500 fallback so the client always receives
  a parseable body.
- Hot-fixed `ManualBillingClient.uploadProof` to read the response
  body as text first, attempt `JSON.parse` defensively, and clear
  the loading spinner inside a `finally` block so any error path
  releases the UI.
- Made `parseListeningPassage` defensive: it now also pulls
  Indonesian from `{ indonesia | indonesian | id | translation |
  terjemahan } [...]` objects, from per-line arrays of objects
  under `lines` / `transcript` / `items` / `entries` / `content`
  wrappers, and from `questionsJson` as a last resort. The fix is
  read-only — no migration needed for existing rows.
- Tightened `toStringArray` in `lib/nihongo/listening.ts` to return
  `null` (not an empty array) when nothing string-shaped is found,
  so the `??` fallback chain in `parseListeningPassage` reaches the
  defensive extractors instead of short-circuiting on `[]`.

### Verification

- `npx tsc --noEmit`: passed.
- `npm test`: 6 policy tests passed.
- Manual UAT: theme toggle switches between Nexus / Squid /
  Rockstar without page reload, persists across refresh, never
  affects `/platform/*` or `/admin/*` surfaces.
- Manual UAT: billing manual-payment flow on Vercel Preview —
  proof upload completes, status transitions to
  `WAITING_VERIFICATION`, error path shows a useful message
  instead of an infinite spinner.
- Manual UAT: Listening pages — Indonesian toggle now reveals
  translations on rows that previously rendered blank.

### Known Notes

- Production data stored under the old upload-proof flow with a
  `public/uploads/...` URL is no longer reachable from a Vercel
  serverless container (those bytes never persisted). Future
  uploads land in the database as data URLs and survive cold
  starts.
- The base64 column inflates `PaymentProof.fileUrl` rows up to
  ~6 MB. If proof volume grows, migrate to Vercel Blob in a
  follow-up.
- `next-themes` was uninstalled. The in-house provider is the
  intended long-term implementation because it can stay scoped to
  the Nihongo route without touching the root `<html>` element.

## RN-2026.05.06-003

Completed Nexus AI Nihongo Squid-Inspired Theme Refresh.

### Background

The previous palette (slate/cyan/blue, soft white surfaces) was reported as too generic for a learning product that wants to feel bold and memorable. This release repaints the entire Nexus AI Nihongo route with a dark + neon-pink (#ED1A7F) + tracksuit-teal (#00B894) palette inspired by the Squid Game visual language, while keeping all copy strictly in learning-platform tone (no game-thematic text).

### Included Changes

- Wrapped the Nihongo route shell in `<div data-theme="squid">` and added a scoped CSS override block to `app/globals.css` that translates the existing slate/cyan/blue Tailwind utility classes into dark surfaces, white text, and pink accents inside `[data-theme="squid"]` only. The Platform shell and other apps are not affected.
- Reduced display text sizes inside `[data-theme="squid"]` by ~12-15% (`text-5xl` → 2rem, `text-4xl` → 1.65rem, `text-3xl` → 1.4rem, ..., `text-base` → 0.9rem) so headings stop dominating learning content.
- Disabled inline gradient backgrounds inside `[data-theme="squid"]` so cards present a single dark surface tone consistently across the route.
- Restyled `<input>`, `<textarea>`, and `<select>` inside the theme with dark surface, white text, and a pink focus ring.
- Refreshed `NihongoSidebar` with deep-black background, pink active-state highlight, ○ △ □ shape markers as decorative icons, soft watermark shapes, and gold/teal section dividers.
- Refreshed the Nihongo header with dark surface, pink "Mulai Belajar" CTA, and outlined "← Back to Platform" pill.
- Added a `theme="squid"` variant to `EngagingLoader` and switched `app/apps/nihongo/loading.tsx` to use it (pink spinner, white text on dark, ○△□ glyph row).
- Replaced both the sidebar and the dashboard hero logo with `Nexustalenta.svg` (case-sensitive — Vercel runs Linux), framed by a soft pink halo and pink drop-shadow, sized 72px in the sidebar and 120px in the dashboard hero.
- Used plain `<img>` for the logo because the SVG is served as-is and `next/image` would require enabling `dangerouslyAllowSVG` in `next.config.ts`.

### Verification

- `npx tsc --noEmit`: passed.
- `npm test`: 6 policy tests passed.
- `npm run lint`: passed with existing `<img>` optimization warnings only (logo intentionally uses `<img>` for SVG).
- Manual browser walk through `/apps/nihongo/dashboard`, `/apps/nihongo/curriculum`, `/apps/nihongo/flashcards`, `/apps/nihongo/tutor`, `/apps/nihongo/quiz`, `/apps/nihongo/game`, `/apps/nihongo/reading`, `/apps/nihongo/listening`, `/apps/nihongo/mock-test/n5`: dark surfaces apply consistently via the override, headings are tighter, sidebar active state highlights, mobile drawer auto-closes.
- Functional regression test for Nexus Kingdom game module: `npx tsx scripts/functional-test-game.ts` reports 17/17 pass; HTTP smoke at `/api/game/me` returns proper `401` (no `findUnique` crash) — confirms the run-time Prisma client carries the game models added earlier in the day.
- `/platform/*` routes verified visually unaffected (still slate/cyan).

### Known Notes

- The CSS override approach intentionally does not touch elements that use raw inline `style={{...}}` colours. Components that use `bg-gradient-*` utility classes are flattened to a single dark surface (`#141416`) inside the theme. If a specific page wants its gradient back, it can use a hardcoded class outside the standard palette.
- `Nexustalenta.svg` (~20KB) is referenced with the exact case it lives on disk; `nexustalenta.svg` (lowercase) does not exist in the repo and would 404 on Vercel.
- Rollback target if this thematic refresh needs to be reverted: tag `prod-rollback-sidebar-improved-20260506` (sidebar UX + engaging loaders + saya copy fix, original cool palette intact).
- Tagged as `prod-checkpoint-20260506-squid` for future rollback reference.

## RN-2026.05.06-002

Completed Sidebar and Loader UX Improvements.

### Included Changes

- Reduced both Nihongo and Platform sidebar width from `w-72` (288px) to `w-56` (224px) and tightened internal padding to free up content area.
- Refactored both sidebars to mark the currently active route with a coloured background and `aria-current="page"`, using `usePathname()` from `next/navigation`.
- Split `PlatformSidebar` into a server wrapper (`PlatformSidebar.tsx`) that fetches the session and a client navigation component (`PlatformSidebarNav.tsx`) so that active-route detection can run on the client without losing server-side admin checks.
- Updated `MobileSidebarDrawer` to track `usePathname()` and auto-close when the route changes, so tapping a menu item on mobile closes the overlay instead of leaving it stuck open.
- Added a shared `EngagingLoader` component plus `app/apps/nihongo/loading.tsx` and `app/platform/loading.tsx` route segments so that route transitions show an animated spinner with rotating Indonesian copy instead of a blank screen.
- Normalized the AI Tutor opening message in `app/apps/nihongo/tutor/page.tsx` from `"Halo, gue Nexus AI Nihongo Tutor"` (slang) to `"Halo, saya Nexus AI Nihongo Tutor"` (formal) and replaced `"lo"` with `"Anda"` to match the rest of the platform's tone.

### Verification

- `npx tsc --noEmit`: passed.
- `npm test`: 6 policy tests passed.
- `npm run lint`: passed with existing `<img>` optimization warnings only.
- Manual browser walk: nihongo and platform sidebars render at the new width, active route highlights, mobile drawer closes after navigation, route transition shows the engaging loader.

### Known Notes

- Visual palette is unchanged in this release — sidebars and loaders still use the existing slate/cyan/blue scheme; theme refresh is staged separately.
- This release is tagged `prod-rollback-sidebar-improved-20260506` and is the rollback target if a later thematic deploy needs to be reverted.

## RN-2026.05.06-001

Completed Production Seed Hotfix and Working Tree Sync.

### Background

A production auto-deploy from `git push` to `main` removed curriculum lessons 41 (Kanji N5 Foundation) and 42 (Kanji N4 Foundation) and reset admin app access from `NON_EXPIRING` to `ANNUAL` with a `+1 year` expiry. Investigation found that the deployed commit `9ebc97e` shipped with older versions of `prisma/seed-curriculum.ts` (which performed `deleteMany()` on all lessons and re-created only 40 lessons) and `prisma/seed-platform.ts` (which forced admin access to `ANNUAL` with a 1-year expiry). Because `npx prisma db seed` runs on every Vercel build, every auto-deploy from `main` overwrote production data using these stale seeds. Fixed versions of both seed scripts already existed in the local working tree but had not been committed to git; they were applied to production on 2026-05-04 via a direct `vercel --prod` upload and then quietly drifted away from the git source of truth.

### Included Changes

- Rolled back production alias to `nexus-platform-igmao1qeq` (`dpl_F3MbmVXbYPquDvMP4cbJeVTrvCeR`) via `vercel rollback` to immediately stop the data loss bleed.
- Synced 173 file changes from the local working tree to `git` as a single commit on `main`, including 6 previously untracked Prisma migrations (`add_analytics_module`, `add_nihongo_character_content`, `add_kingdom_listening_module`, `add_community_chat`, `add_nexus_kingdoms_game`, `make_admin_access_non_expiring`).
- Brought the curriculum, platform, admin, analytics, kingdoms game, community chat, listening, reading roadmap, ai-chan, and manual billing modules under git source control to match what was already running in production.
- Tagged the commit as `prod-checkpoint-20260506` so future rollbacks have a named reference.
- Updated `.gitignore` to exclude `nexus-platform*.env` secret files, `dev-server*.log` dev output, the local `.claude/` agent settings, and the `public/uploads/` user-generated content directory; previously tracked `dev-server.log` and `dev-server.err.log` were untracked from git.
- Promoted the resulting Vercel build `nexus-platform-82e16uhwb` to the production alias `nexus-platform-ai.vercel.app`.

### Verification

- Vercel build log for `nexus-platform-82e16uhwb` confirmed `17 migrations found in prisma/migrations`, `No pending migrations to apply`, and `Lessons seeded: 42 (2 created, 40 updated)` — the 2 created entries restored Kanji N5 and Kanji N4 foundation lessons.
- Production alias `nexus-platform-ai.vercel.app` confirmed pointing to `nexus-platform-82e16uhwb` after `vercel promote`.
- Previous production deployment `nexus-platform-igmao1qeq` retained as fallback rollback target.

### Known Notes

- `npx prisma db seed` continues to run on every Vercel production build. With the corrected seed scripts in `main`, this is now safe (curriculum uses upsert and admin access stays non-expiring), but the destructive-by-default seed pattern should be reviewed before adding any new seed file that mutates user data.
- The 2026-05-04 manual `vercel --prod` upload deploy bypassed git history, which created the divergence that caused this incident; future production deploys should always go through `git push` to keep git as the single source of truth.

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
