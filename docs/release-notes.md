# Release Notes

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
