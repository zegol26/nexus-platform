# Release Notes

## [vNext] - Nexus AI Nihongo Squid-Inspired Theme Refresh

### Changed

- Repainted the entire `/apps/nihongo` route with a dark + neon-pink (#ED1A7F) + tracksuit-teal (#00B894) palette via a `[data-theme="squid"]` CSS override block in `app/globals.css`. Existing slate/cyan/blue Tailwind utility classes are translated automatically inside the theme without editing every page.
- Reduced display text sizes inside the theme by ~12-15% (`text-5xl` → 2rem … `text-base` → 0.9rem) so headings stop dominating learning content.
- Disabled inline gradient backgrounds inside the theme to keep card surfaces flat.
- Restyled `<input>`, `<textarea>`, `<select>` inside the theme with dark surface and pink focus ring.
- Refreshed `NihongoSidebar` with deep-black background, pink active-state highlight, ○ △ □ shape markers as decorative icons, soft watermark shapes, and gold/teal section dividers.
- Refreshed the Nihongo header with dark surface, pink "Mulai Belajar" CTA, and outlined "← Back to Platform" pill.
- Added a `theme="squid"` variant to `EngagingLoader` and switched `app/apps/nihongo/loading.tsx` to use it.
- Replaced both the sidebar and the dashboard hero logo with `Nexustalenta.svg` (case-sensitive), framed by a soft pink halo, sized 72px in the sidebar and 120px in the dashboard hero.

### Tested

- `npx tsc --noEmit`
- `npm test`
- `npm run lint`
- Functional regression: `npx tsx scripts/functional-test-game.ts` (17/17)
- HTTP smoke against `/api/game/me` returns proper `401` (no `findUnique` crash)
- Manual UAT of every Nihongo page; Platform shell verified visually unaffected.

### Known Limitations

- CSS override does not affect elements that use inline `style={{...}}` colours.
- `bg-gradient-*` utilities are flattened to single-tone surfaces inside the theme.
- Rollback target: tag `prod-rollback-sidebar-improved-20260506`.

## [vNext] - Sidebar and Loader UX Improvements

### Improved

- Reduced Nihongo and Platform sidebar width from 288px to 224px and tightened spacing to give content more room.
- Marked the currently active route in both sidebars with a coloured background and `aria-current="page"` so users always know which page they are on.
- Split `PlatformSidebar` into a server wrapper plus a `PlatformSidebarNav` client component so active-route detection runs in the client without losing the server-side admin session check.
- Auto-closed the mobile sidebar drawer when the route changes by tracking `usePathname()` inside `MobileSidebarDrawer`.
- Added a shared `EngagingLoader` and Next.js `loading.tsx` route segments under `/apps/nihongo` and `/platform` so route transitions show an animated spinner with rotating Indonesian copy instead of a blank screen.
- Normalised the AI Tutor opening message from informal slang ("gue", "lo") to formal Indonesian ("saya", "Anda") to match the rest of the platform's tone.

### Tested

- `npx tsc --noEmit`
- `npm test`
- `npm run lint`
- Manual UAT: navigation between sidebar entries, mobile drawer auto-close, loader visibility on slow routes.

### Known Limitations

- Visual palette is intentionally unchanged in this release; thematic refresh is shipped as a separate release on top of this checkpoint.

## [vNext] - Production Seed Hotfix and Working Tree Sync

### Fixed

- Restored curriculum lessons 41 (Kanji N5 Foundation) and 42 (Kanji N4 Foundation) that were removed from production by an auto-deploy running stale seed code that called `deleteMany()` on all lessons before re-creating only 40.
- Restored admin app access to `NON_EXPIRING` after stale seed code reset it to `ANNUAL` with a 1-year expiry on every deploy.

### Changed

- Synced the local working tree to `git` as a single commit on `main` covering 173 files, including 6 Prisma migrations (analytics, character content, kingdom listening, community chat, nexus kingdoms game, admin non-expiring access) and the admin/analytics/kingdoms/community/listening/reading/ai-chan/manual-billing modules that were already running in production but had never been committed.
- Tagged the synced commit as `prod-checkpoint-20260506` for future rollback reference.
- Promoted Vercel deployment `nexus-platform-82e16uhwb` to the production alias and kept `nexus-platform-igmao1qeq` as a fallback rollback target.
- Tightened `.gitignore` to exclude `nexus-platform*.env` secret files, `dev-server*.log`, `.claude/`, and `public/uploads/`; untracked previously tracked dev server logs.

### Tested

- Vercel production build verified `Lessons seeded: 42 (2 created, 40 updated)` and `17 migrations found / No pending migrations to apply`.
- Production alias verified pointing to the new deployment after `vercel promote`.

### Known Limitations

- Vercel production builds continue to run `npx prisma db seed` automatically; the seed scripts in `main` are now safe (curriculum upsert, admin non-expiring) but any new seed file that mutates user-owned data should be reviewed before merge.
- Direct `vercel --prod` uploads bypass git history; production deploys should always go through `git push` to keep git as the single source of truth.

## [vNext] - Kingdom Load Fix and Community Board Refresh

### Fixed

- Fixed Nexus Kingdom load failure for first-time game users by removing a parallel kingdom initialization race.
- Added safer JSON error handling for `/api/game/me` to make game load failures diagnosable.

### Improved

- Renamed the community experience headline to “Komunitas Board”.
- Redesigned the community board with higher contrast futuristic styling, compact typography, topic navigation, and denser chat layout.
- Moved community information and rules directly under the hero section.
- Condensed community information and highlighted Do/Don’t rules with clear contrast.

### Tested

- `npx tsc --noEmit`
- `npm run validate:community`
- `npm run validate:game`
- `npm run build`

## [vNext] - Admin Non-Expiring Access Hotfix

### Changed

- Admin and super admin app access now uses `accessExpiresAt = null` instead of long-duration expiry dates.
- Admin grant API now clamps normal user grants to a safe maximum of 3650 days and automatically makes admin grants non-expiring.
- Admin Access Control UI now explains that admin access is non-expiring.

### Fixed

- Prevented production errors caused by very large admin expiry durations such as 30000 days.
- Added migration cleanup so existing admin app access rows are converted to non-expiring access.

### Tested

- `npx prisma migrate deploy`
- `npx prisma generate`
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- Production deploy to `https://nexus-platform-ai.vercel.app`

### Known Limitations

- Normal user app grants remain duration-based; permanent access for non-admin users should be added as an explicit future option if needed.

## [vNext] - Community Admin Authority and Nihongo Realms Game

### Added

- Added platform-level Game page at `/platform/game` for kingdom overview, continent assignment, resources, hero, army power, defense power, leaderboard preview, and battle logs.
- Added Nihongo Game page at `/apps/nihongo/game` for JLPT learning rewards, training, resource conversion, castle upgrade, deck preview, and battle target scouting.
- Added Nexus Kingdoms: Nihongo Realms data layer with kingdoms, resources, army units, battle logs, cards, ledgers, and daily reward counters.
- Added admin-only community controls for deleting rooms and messages.

### Improved

- Admin users now have full community room creation authority.
- Lesson, Reading, Listening, Mock Test, Flashcard, and Quiz reward flows now also sync into the new kingdom resource ledger.
- Hidden attack and defense weapon modifiers remain server-side and are not exposed through public game UI payloads.

### Tested

- `npx prisma migrate deploy`
- `npx prisma generate`
- `npx tsc --noEmit`
- `npm run validate:community`
- `npm run validate:game`
- `npm run build`

### Known Limitations

- Battle is turn-based MVP without real-time matchmaking.
- Deck effects are displayed and earned as MVP cards, but advanced card modifiers are staged for the next iteration.
- Manual demo learning reward buttons on `/apps/nihongo/game` use demo source keys; production learning flows send real source references where available.

## [vNext] - Nexus Kingdom and Listening MVP

### Added

- Added Nexus Kingdom gamification profile with XP, build points, coins, daily cap, castle levels, and achievements.
- Added animated Japanese fantasy castle progression UI without external image assets.
- Added Listening module at `/apps/nihongo/listening` with roadmap cards, audio player, transcript toggles, and completion tracking.
- Added admin Listening Manager for audio + JSON metadata upload and listening entry deletion.

### Improved

- Reading data now uses a `contentType` discriminator so Reading and Listening share the same content table safely.
- Lesson, Reading, Listening, Quiz, Flashcard, and Mock Test flows can award Nexus Kingdom rewards without blocking learning if rewards fail.

### Tested

- `npx prisma migrate deploy`
- `npx prisma generate`
- `npx tsc --noEmit`
- `npm run build`
- `npm run lint`
- `npm run test`

### Known Limitations

- Listening audio is stored as a database data URL for MVP stability; object storage should be added before large production audio libraries.
- Flashcard/quiz client-side reward calls are MVP-grade and should be backed by server-side answer validation for anti-abuse hardening.

## [vNext] - Reading Roadmap Upgrade

### Changed

- Replaced legacy Reading page with Reading Skill Roadmap experience.

### Added

- Visual N5 to N4 reading progression path.
- Avatar-based roadmap progress indicator.
- Enhanced article detail reading experience.
- Reading completion tracking integration using existing analytics events.
- Idempotent reading article seed from `prisma/data/nihongo-reading-articles.fixed.json`.

### Improved

- Unified reading progression UX.
- Preserved existing Reading route for backward compatibility.
- Added stable article detail URLs under the existing `/apps/nihongo/reading` route.
- Added `/apps/nihongo/assessment` compatibility redirect to the existing pre-assessment page for route regression coverage.

### Tested

- Regression tested all Nihongo core modules.
- Verified responsive roadmap UI.
- Verified seed idempotency.
- Verified article detail toggles, completion tracking, and previous/next navigation.

### Known Limitations

- Reading completion uses existing `AnalyticsEvent` records instead of a dedicated reading progress table to avoid a schema migration.
- Existing generated/cached reading API remains available for backward compatibility, but the primary Reading page now uses seeded roadmap articles.
