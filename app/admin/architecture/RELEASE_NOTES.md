# Release Notes

## Revision History

| Release Note | Date/Time (JST) | Author | Status | Summary |
| --- | --- | --- | --- | --- |
| RN-2026.05.28-001 | 2026-05-28 00:25 +09:00 | Nexus Platform Team | Completed | Fixed Nexus Kingdom target visibility and retaliation: target scouting now prioritizes recent attackers, lists kingdoms across all continents instead of only the first six, and incoming attack notifications include `Serang balik`. |
| RN-2026.05.27-004 | 2026-05-27 23:58 +09:00 | Nexus Platform Team | Completed | Fixed the remaining plan catalog regression: billing/admin now self-heal separate Monthly, Quarterly, and Yearly rows per app, Settings locks period/duration instead of editing one monthly row into another period, and favicon uses `/nexus-ai-logo.png`. |
| RN-2026.05.27-003 | 2026-05-27 23:45 +09:00 | Nexus Platform Team | Completed | Fixed admin plan pricing/period settings and checkout visibility regression: admin now edits rupiah, fixed periods update duration, `/checkout` lists all active order items, and billing exposes sandbox checkout only when sandbox UAT is enabled. |
| RN-2026.05.27-002 | 2026-05-27 23:10 +09:00 | Nexus Platform Team | Completed | Added Midtrans Finish Redirect URL `/payment/finish`, restored Academy Home navigation from login/platform without logging users out, and enforced 4-hour idle logout on protected shells. |
| RN-2026.05.27-001 | 2026-05-27 22:30 +09:00 | Nexus Platform Team | Completed | Payment gateway RCA and hardening: restored Academy checkout after a Vercel project/domain alias regression, made production Midtrans an environment-driven always-on runtime path, limited Admin Console controls to sandbox open/close only, and documented deployment countermeasures. |
| RN-2026.05.24-002 | 2026-05-24 01:30 +09:00 | Nexus Platform Team | Completed | Reinforced app access enforcement so expired access no longer opens app routes/features, normal users only see valid owned apps, internal lesson engine is admin-only, and mojibake characters were cleaned from Nihongo/English/Arabic app UI and tutor copy. |
| RN-2026.05.24-001 | 2026-05-24 00:30 +09:00 | Nexus Platform Team | Completed | Public Nexus Talenta Indonesia Academy commerce readiness release: redesigned landing/login/register/platform surfaces, public legal/contact/checkout pages, reusable promo campaign admin, Midtrans sandbox checkout/control/log UI, registration email validation and confirmation email support, and public restricted overview-trial mimics for Nihongo, English, Arabic, and PMP apps. |
| RN-2026.05.08-001 | 2026-05-08 21:00 +09:00 | Nexus Platform Team | Completed | Nexus Kingdoms Mobile Legends revamp — per-level castle PNG art (10 stages), hero PNG with mystic float aura on the left of the castle, hero rename + one-time selection ritual with random initial assignment, real attack mechanics (proportional troop casualties on both sides + resource looting), defender attack-notification popup on game entry, sophisticated battle report modal post-attack with result-tier theming, interactive shield/cooldown/error toasts replacing the banner, continent overflow capacity 5 with Roman-numeral variants, cross-continent attacks always open, full mobile responsiveness pass on all game modals and the castle frame. |
| RN-2026.05.07-002 | 2026-05-07 18:30 +09:00 | Nexus Platform Team | Completed | Added Fast MVP AI Conversation Voice on the AI Tutor page — push-to-talk with Whisper transcription, voice-mode tutor reply, and ElevenLabs (or OpenAI) TTS playback for Ai-chan. Trial learners get 5 voice conversations/day, tracked via `FeatureUsage.VOICE_CONVERSATION`. |
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

## RN-2026.05.28-001

Fixed Nexus Kingdom target discovery and retaliation visibility.

### Root Cause

- Cross-continent attacks were already enabled server-side, but the Target
  Battle UI rendered only the first six targets.
- Target ordering did not prioritize kingdoms that had recently attacked the
  current user, so a defender could receive an attack notification but fail to
  find that attacker in the visible target list.
- Incoming attack notifications only allowed acknowledge/next, not direct
  retaliation.

### Included Changes

- `getTargets` now merges recent attackers first, then all visible kingdoms
  across continents, de-duplicated.
- Target scouting now returns up to 200 kingdoms instead of a tiny preview.
- Target Battle UI renders the full returned list in a scrollable panel and
  displays the visible target count.
- Incoming attack notification modal now includes `Serang balik`.

### Verification

- Run `npm run validate:game`.
- Run `npm test`, `npx tsc --noEmit`, and `npm run build`.
- Browser verify `/platform/game` or `/apps/nihongo/game` as a logged-in user:
  target list shows multiple continents, and incoming attack modal can start a
  counterattack.

## RN-2026.05.27-004

Fixed the remaining plan catalog regression where billing still showed only a
monthly option and Admin Settings could make a monthly row look quarterly until
catalog repair reset it.

### Root Cause

- Production data could still contain only one `*_MONTHLY` plan per app.
- Admin Settings allowed operators to edit `billingPeriod` on that same monthly
  row instead of presenting separate canonical rows for Monthly, Quarterly, and
  Yearly.
- Seed/catalog repair still treated the monthly row as the canonical monthly
  record, so a changed `*_MONTHLY` row could be repaired back to `MONTHLY`.

### Included Changes

- Added runtime plan catalog repair that ensures every learning app has three
  separate active plan records: Monthly, Quarterly, and Yearly.
- Updated `/checkout`, `/platform/billing`, and `/admin/settings` to call the
  catalog guard before reading plans.
- Changed Admin Settings so billing period and duration are displayed as fixed
  row properties; admin edits price and active state only.
- Updated seed behavior so existing admin-edited prices/active flags are not
  overwritten during monthly plan repair.
- Switched root favicon and Apple touch icon to `/nexus-ai-logo.png`.

### Verification

- Regression must confirm user billing has Monthly, Quarterly, and Yearly
  options after `/platform/billing` loads.
- Regression must confirm Admin Settings shows separate period rows and saving
  does not convert Quarterly/Yearly back to Monthly.
- Verify `/checkout`, `/platform/billing`, `/admin/settings`, and favicon
  metadata on the candidate deployment before aliasing production.

## RN-2026.05.27-003

Fixed Settings and checkout regressions around plan periods, price entry, and
sandbox UAT visibility.

### Root Cause

- Admin Settings exposed the internal `priceCents` field directly, which made
  operators enter storage units instead of rupiah.
- Changing `billingPeriod` did not update `durationDays`, so Quarterly/Yearly
  looked selected while invoices could still use a 30-day duration.
- Public `/checkout` hard-filtered `MONTHLY`, so active quarterly/yearly plans
  could disappear from the order page and make the page look empty.
- User billing had one Midtrans button tied to the effective runtime state,
  instead of showing production and optional sandbox UAT actions separately.

### Included Changes

- Added pricing policy helpers for rupiah-to-cents storage conversion and fixed
  period durations.
- Changed Admin Settings labels and payloads from cents to rupiah.
- Normalized admin settings API writes so `MONTHLY`, `QUARTERLY`, and `YEARLY`
  always store 30, 90, and 365 days respectively.
- Updated `/checkout` to show every active plan, including monthly, quarterly,
  yearly, and custom plans.
- Updated user billing so production `Lanjut bayar` stays available in
  production, while `Lanjut bayar (sandbox)` appears only when sandbox checkout
  is enabled.

### Verification

- `npm test`: includes pricing period and Midtrans mode selection regression
  coverage.
- `npx tsc --noEmit`: must pass before deployment.
- Before aliasing production, verify `/checkout`, `/api/auth/csrf`,
  `/admin/settings`, and `/platform/billing` on the candidate deployment.

## RN-2026.05.27-002

Added the customer-facing Midtrans finish page and tightened authenticated
navigation/session behavior.

### Included Changes

- Added public Finish Redirect URL:
  `https://nexustalenta-academy.com/payment/finish`.
- Updated Midtrans Snap callback payloads so `callbacks.finish` points to
  `/payment/finish` instead of sending customers straight back into
  `/platform/billing`.
- Added Academy Home navigation from `/login` and the platform shell. These are
  normal navigation links and do not clear the NextAuth session.
- Added 4-hour idle logout:
  - server-side single-session records expire after 4 idle hours;
  - NextAuth JWT/session max age is 4 hours;
  - protected shells sign out after 4 hours without browser activity.

### Verification

- Run `npm test`, `npx tsc --noEmit`, and `npm run build` before promotion.
- Verify `/payment/finish`, `/login`, `/platform/dashboard`, `/checkout`, and
  `/api/auth/csrf` on the candidate deployment before aliasing production.

## RN-2026.05.27-001

Payment gateway RCA and hardening after the Academy checkout regression.

### Impact

- `nexustalenta-academy.com/checkout` temporarily returned HTTP 500 after the
  custom domain was pointed at a deployment with the wrong database/auth env.
- Login submission was affected because the selected deployment did not have
  the same NextAuth/database runtime configuration as the stable Academy
  deployment.
- Production Midtrans credentials were added safely as Vercel Environment
  Variables, but the gateway could not be validated through the web flow until
  the deployment/domain/env mismatch was corrected.

### Root Cause

- The live Academy custom domain was changed before the candidate deployment
  was verified against the correct Vercel project and environment.
- Direct production deploys allowed local `.env` files to influence the Vercel
  deployment package, including a local-only database URL.
- The Admin Console exposed production/sandbox switching as a mutable UI
  control. That made production payment activation look like an admin setting,
  when it should be an environment-backed deployment concern.

### Included Changes

- Restored the custom domain to the known stable deployment before continuing
  payment work.
- Added `.vercelignore` to exclude `.env` and `.env.*` from Vercel uploads.
- Added production Midtrans runtime policy:
  - production deployments use production mode automatically;
  - production checkout is always open when production keys are configured;
  - admin UI can only open/close sandbox checkout for UAT.
- Removed production/sandbox switching from Admin Settings and the compact
  payment control.
- Kept per-transaction `midtransMode` in payment payloads so webhooks verify
  signatures against the mode used when the payment was created.
- Added focused policy tests for production-always-on behavior and sandbox
  toggle behavior.

### Verification

- `nexustalenta-academy.com/checkout`: restored to HTTP 200 after rollback to
  the stable deployment.
- `nexustalenta-academy.com/api/auth/csrf`: HTTP 200 after rollback.
- Local Midtrans sandbox Snap regression: sandbox key created a Snap token and
  redirect URL on `app.sandbox.midtrans.com`.
- `npm test`: passed after payment policy changes.

### Countermeasures

- Before any future production alias change, verify the candidate deployment
  URL directly for `/checkout` and `/api/auth/csrf`.
- Before any Vercel deploy, run `vercel inspect` and `vercel alias ls` to
  confirm the intended project and current domain owner.
- Do not direct-upload local env files. Keep `.vercelignore` in place.
- Do not store server keys or live payment credentials in Admin Console or
  database settings. Use Vercel Environment Variables only.
- Treat production Midtrans activation as an environment/deployment concern,
  not an admin toggle.

## RN-2026.05.24-002

Completed access enforcement and encoding cleanup hotfix.

### Included Changes

- Added shared platform access helpers for admin-role checks and valid
  app-access checks (`ACTIVE` and not expired).
- Reinforced Nihongo, English, Arabic, PMP, and internal lesson-engine
  route entry so normal users are redirected back to the platform when
  they do not have valid app access.
- Removed auto-grant behavior from Arabic and PMP layouts. Trial/access
  must now come from registration, admin grant, or validated billing.
- Updated dashboard and `/platform/apps` so normal users only see apps
  with valid active access. Expired access no longer counts as owned app
  access in those user-facing lists.
- Removed the internal lesson-engine app from the user app registry and
  made `/apps/lessons/dashboard` admin-only.
- Hardened feature guards so expired access is rejected for Nihongo
  lesson, flashcard, tutor, voice, reading, Arabic tutor, and PMP AI
  generator paths.
- Cleaned mojibake characters from Nihongo shell/sidebar/tutor copy,
  Arabic shell, English dashboard copy, and app registry descriptions.

### Verification

- `npm run build`: passed.
- Browser verified `/apps/nihongo/dashboard` loads for the current valid
  user without broken `â/Ã/ð` characters and without `Nexus Lessons` or
  `nexus_lesson` appearing in the app UI.

### Known Notes

- Admin and super admin still bypass app-expiry checks for operations
  and support workflows.

## RN-2026.05.24-001

Completed the Nexus Talenta Indonesia Academy public commerce and UAT
readiness release.

### Background

The platform needed to satisfy payment-provider review requirements
while keeping the actual product surface credible for UAT: public pages
must be accessible, products/services must be clearly described and
orderable, legal/refund/contact information must exist, and authenticated
users need a clearer post-login program/billing experience. The public
marketing surface also needed to show prospective learners what the
apps feel like before buying, without exposing full AI chat, recording,
reading, listening, simulator, or progress-saving functionality.

### Included Changes

- Rebuilt the public landing experience around Nexus Talenta Indonesia
  Academy branding, including the provided Nexus logo, program cards,
  product/service descriptions, order CTAs, and a custom AI learning
  apps commercial banner for schools, companies, training centers, and
  UMKM.
- Added public legal and support pages: `/terms`, `/refund-policy`,
  `/contact`, and `/checkout`.
- Added restricted overview-trial routes for `/overview/nihongo`,
  `/overview/english`, `/overview/arabic`, and `/overview/pmp`. Each
  route mimics the app workspace with sidebar navigation, coach/chat
  teaser, module map, locked controls, and login/order CTAs. Trial
  pages intentionally disable chat input, recording, reading, listening,
  simulator scoring, and progress persistence.
- Reworked landing program cards so `Overview trial` opens the
  appropriate public mimic route instead of expanding static marketing
  copy inline.
- Refreshed login/register and post-login platform surfaces with a more
  polished ed-tech visual direction and copy aligned to Nexus Talenta
  Indonesia Academy rather than a single Nihongo-only product.
- Added client and server email validation to registration, normalized
  email addresses, and added transactional registration-confirmation
  email support via SMTP env vars. Registration succeeds gracefully when
  SMTP is not configured.
- Added Midtrans sandbox pre-integration for billing checkout:
  transaction creation, Snap/token handling, sandbox status awareness,
  webhook/status validation helpers, and user billing copy that keeps
  public payment language simple while leaving Midtrans-specific detail
  in admin UI.
- Updated Admin Console payment tools with sandbox open/close visibility
  control, Midtrans-style transaction log summaries, monthly accordion
  grouping, and simplified payment action surfaces.
- Added reusable promo campaign admin UI so promo campaigns can be
  edited and reused.
- Improved Nexus AI Nihongo bright theme contrast so the light skin is
  easier to read in UAT.

### Files Touched

- `app/page.tsx`
- `app/checkout/*`
- `app/contact/*`
- `app/terms/*`
- `app/refund-policy/*`
- `app/overview/[app]/page.tsx`
- `app/login/page.tsx`
- `app/register/page.tsx`
- `app/platform/dashboard/page.tsx`
- `app/platform/programs/page.tsx`
- `app/platform/billing/page.tsx`
- `app/platform/admin/promos/*`
- `app/admin/payments/page.tsx`
- `components/layout/MarketingChrome.tsx`
- `components/marketing/AppOverviewSection.tsx`
- `components/admin/MidtransPaymentControl.tsx`
- `components/admin/PromoCampaignClient.tsx`
- `components/platform/ManualBillingClient.tsx`
- `lib/platform/midtrans.ts`
- `lib/platform/settings.ts`
- `lib/platform/settings-policy.ts`
- `lib/email/*`
- `.env.example`

### Verification

- `npm run build`: passed.
- Browser verified public landing `/#program` shows four `Overview trial`
  links and no longer uses the old inline overview toggle.
- Browser verified `/overview/nihongo`, `/overview/english`,
  `/overview/arabic`, and `/overview/pmp` load with restricted trial
  messaging, disabled inputs, locked sidebar/modules, and login/order
  CTAs.
- Browser verified the Nexus AI Nihongo bright theme contrast update on
  the app route.
- Registration API was tested with a UAT user and the temporary test
  user was removed from the database after verification.

### Known Notes

- SMTP credentials are intentionally not committed. Registration emails
  require SMTP env vars in the deployment environment; without them the
  account still registers and logs a skipped-email state server-side.
- Midtrans keys are stored only in environment variables and must not be
  printed in logs, docs, or screenshots.
- Lint still has unrelated historical warnings/errors in older app/test
  areas; this release gate used the successful production build and
  targeted browser verification.

## RN-2026.05.08-001

Nexus Kingdoms Mobile Legends revamp — castle PNG art per level, hero
selection + mystic float, real attack mechanics with troop loss and
resource looting, defender notification popup, sophisticated battle
report, interactive toasts, continent overflow + cross-continent
attacks, mobile-responsive throughout.

### Background

Nexus Kingdoms previously rendered a single generic SVG silhouette
for every castle level, the hero stat was static text only, and the
attack mechanic only stole resources without any troop casualties.
There was no defender feedback after being attacked and no
sophisticated post-attack report; attack failures (shield, cooldown,
continent lock) showed up as a plain string in a top banner. We
revamp the surface to feel closer to a Mobile-Legends-quality battle
arena while keeping the JLPT learning loop unchanged.

### Included Changes

- Per-level castle PNG art catalog at `lib/game/castle-stages.ts`
  with 10 named tiers wired to `public/Castle/*.png`.
  `components/nihongo/game/CastleVisual.tsx` swaps the SVG for a
  bottom-aligned `next/image` (`quality={95}`, `sizes="100vw,900px"`,
  `priority`) and adds a hero overlay on the left bottom with
  per-aura color (cyan / rose / emerald / violet / amber).
  Hero overlay uses new keyframes in `app/globals.css`:
  `hero-float-bounce` (4s ease-in-out, Ai-chan-style), `hero-runes`
  (rotating dashed ellipses), `hero-aura-pulse`, `hero-aura-soft`,
  `hero-shadow`, `hero-spark` (with delayed variants). All animations
  respect `prefers-reduced-motion`.
- Hero rename + lore in `lib/game/config.ts` and
  `lib/game/public-config.ts`. `heroKey` is unchanged so historical
  rows are unaffected. New fields: `title`, `image`, `aura`.
- One-time hero selection: schema migration
  `prisma/migrations/20260508140000_hero_selected_at` adds
  `GameKingdom.heroSelectedAt`; `getOrCreateGameKingdom` randomizes
  the initial `heroKey` from the 5-strong roster; new
  `selectHero(userId, heroKey)` service function (idempotent —
  rejects if `heroSelectedAt` is already set); new
  `POST /api/game/hero/select`; new `components/game/HeroSelectionModal.tsx`
  shown blocking when `heroSelectedAt` is null.
- Real attack mechanics: `attackKingdom` in `lib/game/service.ts` now
  computes `casualtyPercentsForRatio` (5–50% scaling) and
  `computeCasualties` to decrement `quantity` and `defenseQuantity`
  on both sides' `GameArmyUnit` rows in the same transaction. Schema
  migration `prisma/migrations/20260508120000_battle_casualties_seen`
  adds `attackerCasualtiesJson`, `defenderCasualtiesJson`, and
  `defenderSeenAt` plus a composite index.
- Defender notifications: new
  `GET /api/game/battle/incoming` returns unseen attacks for the
  current user; `POST /api/game/battle/ack` sets `defenderSeenAt`.
  `components/game/AttackNotificationModal.tsx` shows the popup on
  game entry with attacker meta, ATK vs DEF, total troops lost, loot
  per resource, and per-unit before→after breakdown.
- Sophisticated post-attack report:
  `components/game/BattleReportModal.tsx` themed by result tier
  (`MAJOR_WIN`/`FULL_DAMAGE` → gold, `NORMAL_WIN` → emerald,
  `MINOR_WIN` → cyan-violet, `ATTACKER_LOSS` → rose-slate). Includes
  narrative copy per tier, paired Power Cards, loot grid with
  steal-percent badge, casualty blocks both sides, and a sparkle
  field on victory.
- Interactive battle toast stack:
  `components/game/BattleToast.tsx` replaces the previous string-in-
  banner error display. New `toast-slide-in` keyframe in
  `app/globals.css`. Tone-themed icons (🛡️ ⏳ 🗺️ ⚠️ ✕),
  hover-pause progress bar, manual dismiss button, and contextual
  detail (e.g. "Shield {nama} aktif sampai dalam X menit (HH:MM)").
- Structured server errors: `BattleActionError` class with
  `code` + `meta` thrown from the service and rehydrated by the
  attack route at `app/api/game/battle/attack/route.ts`. Codes:
  `INVALID_TARGET`, `SHIELD_ACTIVE`, `COOLDOWN_ACTIVE`. The legacy
  `CONTINENT_LOCKED` was removed as cross-continent attack is now
  always available.
- Continent overflow + cross-continent: `assignContinent()` caps each
  base continent at 5 inhabitants; once full, new arrivals overflow
  into Roman-numeral variants (`Akatsuki Plains II`,
  `Garuda Highlands II`, ...). `lib/game/continents.ts` exports
  `getContinentBaseName` so variant names resolve back to the same
  banner image. `getTargets` and `attackKingdom` no longer filter by
  continent.
- Mobile responsiveness pass: `CastleVisual` heights are
  `compact ? "h-64" : "h-[22rem] sm:h-[26rem] lg:h-[30rem]"` and the
  hero scales `h-56 → h-[18rem] → sm:h-[22rem] → lg:h-[26rem]`.
  All four modals (`BattleReportModal`, `AttackNotificationModal`,
  `HeroSelectionModal`, plus the legacy alert banner replacement)
  use `items-start sm:items-center overflow-y-auto` with `my-auto`
  so tall reports scroll cleanly on small phones; action rows stack
  vertically below `sm`. `ContinentBanner` h1 ramps
  `text-2xl → sm:text-4xl → lg:text-5xl` to avoid crushed phones.

### Files Touched

- `lib/game/service.ts` (BattleActionError, casualty math, selectHero,
  CONTINENT_CAPACITY, assignContinent overflow, cross-continent
  unlock).
- `lib/game/config.ts` (hero rename, hero `image`/`title`/`aura`,
  `HeroAura` type export).
- `lib/game/public-config.ts` (`publicHeroCatalog`).
- `lib/game/castle-stages.ts` (new — 10 stages).
- `lib/game/continents.ts` (new — 5-image registry,
  `getContinentBaseName`, variant-aware `getContinentMeta`).
- `components/nihongo/game/CastleVisual.tsx` (PNG castle + hero
  overlay).
- `components/game/PlatformGameDashboard.tsx` (banner with
  continent image, ML-style panels, hero modal trigger, attack flow,
  toast stack, battle report wiring).
- `components/game/HeroSelectionModal.tsx` (new).
- `components/game/AttackNotificationModal.tsx` (new).
- `components/game/BattleReportModal.tsx` (new).
- `components/game/BattleToast.tsx` (new).
- `app/api/game/hero/select/route.ts` (new).
- `app/api/game/battle/incoming/route.ts` (new).
- `app/api/game/battle/ack/route.ts` (new).
- `app/api/game/battle/attack/route.ts` (forward
  BattleActionError code + meta).
- `app/globals.css` (hero / aura / rune / spark / toast keyframes).
- `prisma/schema.prisma` + migrations
  `20260508120000_battle_casualties_seen` and
  `20260508140000_hero_selected_at`.

### How to Verify

1. Run `npm run dev`, hard reload, open `/platform/game` as a fresh
   user — `HeroSelectionModal` should block until a hero is picked.
2. Confirm a hero — modal closes, the chosen hero floats on the left
   of the castle with its colored aura. Reopen game — modal stays
   gone.
3. Attack a target — `BattleReportModal` opens with tier-themed copy,
   the attacker and defender unit counts are decremented in the DB,
   resource counts on the dashboard refresh.
4. Open the game as the defender — `AttackNotificationModal` pops on
   first entry. Acknowledge — `defenderSeenAt` is set, the modal
   stays gone next entry.
5. Attack a target with an active shield → `BattleToast` (cyan)
   slides in top-right with shield expiry detail. Repeat target
   within 6 hours → amber cooldown toast with cooldown-end timestamp.
6. Create a 6th-account in a base continent that already has 5
   inhabitants → assigned to the next available base. Fill all 5
   bases → 26th lands on `Akatsuki Plains II`.
7. Resize the viewport to 360px wide on the game page — castle
   frame, hero overlay, and all modals fit and scroll properly with
   no horizontal overflow.

### Risks and Rollbacks

- The DB migrations are additive (nullable columns + index). To roll
  back, drop the new columns, then revert the application code. No
  destructive transformation.
- The `BattleActionError` code path may unintentionally narrow the
  set of recognized error codes for clients that previously matched
  on free-form strings. Mitigated by keeping the human-readable
  `error` string identical to the legacy copy.
- The Prisma client is regenerated at build time, but local dev
  servers using Turbopack can keep a stale chunk and report
  `Unknown argument 'heroSelectedAt'` until `.next/` is removed and
  `npm run dev` is restarted.

## RN-2026.05.07-002

Completed Fast MVP AI Conversation Voice for Nexus AI Nihongo.

### Background

The existing AI Tutor only supports text chat. To unlock spoken
practice for JLPT/JFT learners, we add a push-to-talk voice flow on
top of the same tutor pipeline so the existing chat semantics, copy,
and history mechanics stay intact. Voice round-trips call OpenAI
Whisper + GPT-4.1-mini + ElevenLabs/OpenAI TTS, which is roughly 6×
the cost of a text turn, so we cap trial learners at 5 voice
conversations per day.

### Included Changes

- Added `POST /api/voice/transcribe` (`app/api/voice/transcribe/route.ts`).
  Accepts `multipart/form-data` with field `audio`, validates session,
  enforces the 5/day quota via `FeatureUsage.VOICE_CONVERSATION`,
  rejects payloads above 5 MB or unsupported MIME, and returns
  `{ text }` from OpenAI Whisper (`whisper-1`, configurable via
  `OPENAI_TRANSCRIBE_MODEL`). Increments usage only on a successful
  non-empty transcript so failed attempts don't burn quota. Admins
  bypass the quota.
- Added `POST /api/voice/speak` (`app/api/voice/speak/route.ts`).
  Accepts `{ text }` (capped at 1200 chars), tries ElevenLabs first
  when both `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` are
  present, and falls back to OpenAI `gpt-4o-mini-tts` (configurable
  via `OPENAI_TTS_MODEL`) otherwise. Returns `audio/mpeg` directly
  with `X-Voice-Provider` set to `elevenlabs` or `openai`.
- Extended `POST /api/apps/nihongo/tutor` to accept an optional
  `mode: "text" | "voice"` body field. When `voice`, the system
  prompt gains a spoken-style suffix that asks for short flowing
  replies, no markdown, gentle mid-reply corrections, and a
  one-sentence follow-up question to keep the conversation going.
  Existing text callers without `mode` keep their current behavior.
- Added `decideVoiceConversationAccess` and the `VOICE_CONVERSATION`
  feature key to `lib/nexus/access-policy.ts` and
  `lib/nexus/access-guards.ts`. New helper `canUseVoiceConversation`
  reuses the existing `getOrCreateFeatureUsage` daily-window pattern
  (period start = today midnight) so the quota auto-resets every
  day with no cron required.
- Added `components/apps/nihongo/TutorVoicePanel.tsx`. Push-to-talk
  client component with a six-state machine
  (`idle` / `recording` / `transcribing` / `thinking` / `speaking` /
  `error`), animated mic-pulse while recording, animated dots while
  transcribing or thinking, an inline error pill with a Tutup
  button, and a Repeat button driven by the latest object URL.
  Object URLs are revoked on replace and on unmount. If the browser
  blocks autoplay, the panel surfaces a Tap to play Ai-chan voice
  CTA.
- Wired the panel into the AI Tutor page next to the Quick Prompts
  card on desktop / above the chat input on mobile. The page
  exposes a small `handleVoiceTranscript` callback so the panel
  drives transcription and TTS while the page stays responsible
  for chat history, exactly mirroring the text-chat append/error
  shape.
- Updated `.env.example` with the env keys needed for voice:
  `OPENAI_API_KEY`, `OPENAI_TRANSCRIBE_MODEL`, `OPENAI_TTS_MODEL`,
  `OPENAI_NIHONGO_TTS_VOICE`, `ELEVENLABS_API_KEY`,
  `ELEVENLABS_VOICE_ID`, `ELEVENLABS_MODEL_ID`. Whitelisted the file
  in `.gitignore` so it can be committed.
- Persisted every AI Tutor turn (free chat + lesson chat, text + voice)
  into `AnalyticsEvent.metadata` with `userMessage`, `assistantReply`,
  `mode`, `scope`, `messageLength`, `replyLength`. No schema migration —
  reuses the existing `metadata Json?` column.
- Added `lib/analytics/keywordExtraction.ts` — multilingual tokenizer
  (Indonesian + Japanese + English) with character-class transition
  splitting for kanji/hiragana/katakana boundaries (no kuromoji
  dependency), Indonesian + Japanese particle stop-word filtering,
  and a top-N keyword counter.
- Extended Admin Analytics (`/platform/admin/analytics`) with two
  new panels:
  - **AI Tutor Keywords — Pertanyaan Pelajar** — top topics
    learners ask the tutor about. Shows mode breakdown
    (text vs voice).
  - **AI Tutor Keywords — Topik Jawaban Ai-chan** — top topics
    Ai-chan most often teaches in her replies.
  Both render as a tag cloud where size + color intensity scale
  with frequency, with Japanese tokens rendered in Noto Sans JP.

### Verification

- `npx tsc --noEmit`: passed.
- `npm test`: 6 policy tests passed (no Prisma touch needed).
- Manual QA checklist (run on Preview before promoting to prod):
  1. Text chat still answers via the existing flow (no regression).
  2. Mic permission prompt fires the first time.
  3. `🎙 Talk with Ai-chan` toggles to `⏹ Stop & Send` while
     recording, with the rose-pulse ring active.
  4. After Stop, transcript appears as a user bubble in the chat.
  5. AI response appears as an assistant bubble.
  6. Ai-chan voice auto-plays once the audio blob arrives.
  7. `🔁 Repeat` replays the latest audio without making a new call.
  8. Denying mic permission shows a friendly retry message.
  9. Five round-trips succeed; the sixth returns HTTP 429 with the
     `Kuota harian voice conversation Anda sudah habis` reason.
  10. Mobile breakpoint: voice panel stacks above the chat,
      Stop/Repeat buttons remain reachable with one thumb.

### Known Notes

- Voice quota counter resets at local midnight (server date
  boundary) — same window logic the AI Tutor text quota uses.
- ElevenLabs is preferred only when both env keys are present; if
  ElevenLabs returns a non-2xx the route silently retries with
  OpenAI TTS so users always hear a response.
- No DB migration is required for this MVP — voice messages stream
  through the existing chat history append. If we later want to
  filter voice from text in transcripts, store a `metadata.voice`
  flag on a future chat-message column.

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
