# Release Notes

## [2026.07.21] - Nexus AI Nihongo Bottom-Nav Shell Redesign

Status: UAT OK locally. Pending commit/push to production (blocked on a
local git lock at authoring time — see Production Verification).

### Changed

- Removed the 224px `NihongoSidebar` and its `MobileSidebarDrawer` from
  `app/apps/nihongo/layout.tsx`. Replaced with a new fixed bottom
  navigation (`components/apps/nihongo/NihongoBottomNav.tsx`) shown at
  every breakpoint: Home, Latihan (curriculum), Progress
  (badges/JLPT readiness), and a "Lainnya" bottom sheet grouping
  flashcards, quiz, AI tutor, reading, listening, Nexus Kingdoms,
  pre-assessment, rehearsal N5/N4, and mock test N5/N4.
- Slimmed the top header to a single 44–52px row (back-to-platform
  pill, wordmark, language/theme toggle, logout) — no hamburger, no
  secondary CTA row.
- Rebuilt `NihongoDashboardClient.tsx` as a single-column "story mode"
  home: one hero continue-lesson card with progress bar, a horizontal
  "Perjalanan belajar" path preview of upcoming lessons, two compact
  status chips (badge, JLPT N5 readiness), and two quick-action links
  (flashcards, AI tutor) for discoverability now that they moved into
  the "Lainnya" sheet.
- Removed the redundant "Back to dashboard" button from
  `app/apps/nihongo/curriculum/page.tsx` now that Home/Latihan live in
  the bottom nav.
- Bumped `docs/DESIGN.md` to `version: 2` with a new Bottom Navigation
  component spec replacing the Sidebar spec, and an updated Responsive
  Behavior table.

### Fixed

- The `rockstar` Nihongo theme had no `emerald-*` color translation.
  Any "completed" card (`bg-emerald-50` background with
  `text-slate-900`/`text-slate-400` children) rendered white text on a
  light-mint background under `rockstar` — effectively invisible.
  `app/globals.css` now includes a rockstar emerald mapping (dark
  translucent tint + light-green text) mirroring the existing squid
  theme's teal treatment, plus a descendant override so any
  `text-slate-900`/`text-slate-400` nested inside an emerald card
  flips to legible green instead of white.

### Scope / Not Done Yet

- Only the shared shell (layout, nav, header) and the dashboard got a
  full visual pass. Curriculum lesson detail, quiz, flashcards, tutor,
  reading, listening, rehearsal, and mock test pages still render
  their prior denser styling inside the new shell — a content-level
  redesign pass is tracked as future work in `docs/known-issues.md`.
- `components/apps/nihongo/NihongoSidebar.tsx` and
  `components/layout/MobileSidebarDrawer.tsx` are now unused but were
  left in the repo rather than deleted, pending confirmation nothing
  else references them.

### Checks

- `npx eslint` on every changed file — clean.
- Full-project `npx tsc --noEmit --pretty false` did not finish inside
  the authoring sandbox's per-command time budget; **run it locally
  before merging** per `AGENTS.md`.

### Production Verification

- Not yet pushed. A stale `.git/index.lock` in the working environment
  blocked `git add`/`git commit` at authoring time (likely an external
  process — editor, OneDrive, antivirus — holding a handle on the
  Windows-mounted repo folder). Push, Vercel deploy, and the usual
  `/checkout`, `/api/auth/csrf`, `/login` smoke checks are outstanding
  and must be completed before this entry can be marked "Production
  deployed and verified."

## [2026.07.08] - John English PTT STT Language Lock

Status: Production deployed and verified.

### Fixed

- Fixed Talk with John push-to-talk transcription using the shared voice route's Japanese STT language hint.
- Added John tutor language config with English input/output/UI language and `allowMixedLanguage: false`.
- Locked John voice transcription to OpenAI STT language `en` before the John prompt runs, so browser locale or auto language detection cannot turn English speech into Japanese text.
- Added a John-specific post-transcription guard that asks the learner to retry when the transcript is mostly Japanese script.

### Improved

- Scoped John conversation history to English-script turns before sending context to the model.
- Added development-only STT logging for tutor id, course id, selected STT language, browser locale, detected transcript language, raw transcript, prompt language, and history scoping.
- Preserved existing Nihongo voice behavior by keeping the shared transcription route default language as Japanese unless the request identifies John.

### Checks

- `npm test`
- `npx tsc --noEmit --pretty false`

### Manual Regression Checklist

- iPhone Safari with Japanese browser/device locale: Talk with John transcribes English speech as English and John replies in English.
- Speaking Japanese in Talk with John shows the friendly retry message instead of sending Japanese text into the tutor prompt.
- Existing Nihongo voice conversation still uses the Japanese transcription default.

### Production Verification

- Commit `60e9adc` deployed to Vercel production.
- `nexustalenta-academy.com` and `www.nexustalenta-academy.com` were aliased to the verified deployment.
- Smoke checks returned HTTP 200 for `/`, `/checkout`, `/api/auth/csrf`, `/login`, and `/platform/billing`.

## [2026.06.26] - Arabic Brand, English DCE Options, and Nihongo Assessment Variants

Status: Production deployed and verified.

### Added

- Added a dedicated Nexus AI Arabic brand mark for the Arabic sidebar and dashboard hero.
- Added `sanity:nihongo-options` to audit Nihongo pre-assessment and quiz option randomization.
- Added a production-safe migration that creates five curated `AssessmentQuestion` variants per base pre-assessment question from existing database rows.

### Improved

- Kept English DCE at five modules per level and normalized answer option placement across Reading, Listening, Vocabulary, Grammar, and Dialogue questions.
- Added English DCE validation for answer-position distribution so future content cannot silently put every correct answer in option A.
- Randomized Nihongo pre-assessment and quiz options at API response time while keeping string-based answer evaluation intact.
- Updated pre-assessment DB selection to avoid duplicate variants of the same base question in one generated assessment.

### Production Verification

- Commit `427afef` deployed to Vercel production as `nexus-platform-59799kkwt-zegol26s-projects.vercel.app`.
- `nexustalenta-academy.com` and `www.nexustalenta-academy.com` were aliased to the verified deployment.
- Nihongo quiz smoke returned 20 questions with correct answers distributed `A=5, B=5, C=5, D=5`.
- Nihongo pre-assessment smoke returned `source=question_bank`, 22 questions, and database-backed variant tags.
- `/checkout`, `/api/auth/csrf`, and `/login` returned HTTP 200.

## [2026.06.26] - English Mobile TTS Playback and Cache

Status: Production deployed and verified.

### Added

- Added database-backed `VoiceTtsCache` storage for generated voice responses.
- Added cached voice URL mode to `/api/voice/speak`; English clients prepare audio once, then replay from browser object URLs.
- Added explicit English TTS UI states: idle, preparing, ready, playing, blocked, and error.

### Fixed

- Fixed iOS/Safari autoplay policy failures by avoiding `audio.play()` immediately after async TTS generation.
- Updated John voice settings/instructions to sound more alert without generating audio on every replay.
- Added development-only TTS cache and playback logs.

### Manual Regression Checklist

- iPhone Safari: first tap prepares audio, second tap plays; blocked state says, "Audio blocked by browser. Tap Play again."
- Chrome mobile: replaying prepared audio does not call `/api/voice/speak`.
- Desktop Chrome: DCE single voice, DCE dialogue voice, John voice reply, and English interview prompt audio show ready/playing states.

### Production Verification

- Git commit `989cf0b` deployed to Vercel production as `nexus-platform-newxizyo3-zegol26s-projects.vercel.app`.
- Repointed `nexustalenta-academy.com` and `www.nexustalenta-academy.com` to the verified deployment.
- Smoke checks returned `200` for `/`, `/checkout`, `/api/auth/csrf`, and `/login`.
- `/api/voice/speak/cache/not-real` returned `401` without login, confirming the new protected cache route is live.

## [2026.06.17] - Midtrans Settlement Sync and Paid Access Recovery

Status: Production deployed and verified.

### Added

- Added `skills/midtrans-billing.md` as the reusable project skill for future
  Midtrans integration, debugging, reconciliation, and deployment work.
- Added automatic Midtrans Status API fallback sync on customer payment finish,
  billing, dashboard, app launcher, and admin payment surfaces.
- Added admin-only `Sync Midtrans` action for Midtrans payments. The action
  performs provider inquiry and only activates access when Midtrans maps to
  paid; it does not manually mark unpaid orders as paid.

### Fixed

- Fixed paid Midtrans QRIS/Snap orders staying `PENDING` locally when webhook
  delivery did not update the database.
- Made paid access activation atomic and idempotent by updating payment status,
  app access, and source subscription through the same activation path.
- Repointed `nexustalenta-academy.com` from the stale production deployment to
  the latest production deployment after the git deploy completed.

### Production Recovery

- Reconciled `nexus-1781659578035-f7425e21b8c6` for Nexus AI Arabic monthly to
  `PAID` with active app access.
- Reconciled `nexus-1781676345935-2ecabf03eafc58` for Nexus AI English monthly
  to `PAID` with active app access.

### Tested

- `npm run lint`
- `npx tsc --noEmit --pretty false`
- `npm test`
- `npm run build`
- Production smoke:
  - `/checkout` returned `200`
  - `/api/auth/csrf` returned `200`
  - `/payment/finish?order_id=<order>` returned `200`
  - admin sync route returned `403` without login, confirming the route exists
    and is admin-protected

## [vNext] - Certificate UAT

### Added

- Added course certificate generation for eligible users.
- Admin and super admin users are eligible to generate certificates without requiring 100% course progress.
- Added certificate eligibility and generation APIs plus printable certificate detail page.

### Fixed

- Forced typed text, placeholders, disabled states, and browser autofill text in form inputs, textareas, and selects to use dark readable text across login, sign up, and app forms.

### Local UAT

- Local UAT database is `nexus_platform`.
- Applied migration `20260603123000_add_course_certificates` with `npx prisma migrate deploy`.
- Verified local UAT database has 6 users and `CourseCertificate` table is ready.
- Verified seeded admin credentials still match the local environment.
- User acceptance testing passed locally before production push preparation.

### Tested

- `npx prisma migrate status`
- `npx prisma migrate deploy`
- `npx prisma generate`
- `npm test`
- `npx tsc --noEmit`
- `npm run build`

## [2026.06.13] - Anonymous Nihongo Trial and Documentation Consolidation

Status: UAT OK, ready for git/Vercel release.

### Added

- Added anonymous trial access for prospective Nexus AI Nihongo paid users on
  `/apps/nihongo/pre-assessment`, `/apps/nihongo/flashcards`, and
  `/apps/nihongo/quiz`.
- Trial users can experience real pre-assessment scoring, flashcard decks, and
  quiz batches without login.
- Added the canonical AI agent handbook and project memory docs under
  `AGENTS.md`, `docs/`, `tasks/`, and `skills/`.

### Changed

- Other Nihongo app routes remain locked for anonymous users and route back to
  login/checkout instead of opening paid or progress-bearing surfaces.
- Anonymous pre-assessment submissions return a trial result without creating
  assessment sessions, profiles, badges, rewards, or lesson progress.
- Speaking upload/evaluation is skipped in anonymous trial mode because it is
  cost-bearing and not needed to save progress.
- Anonymous trial analytics events are acknowledged but not written to the
  database, keeping the campaign funnel read-only for unauthenticated traffic.
- Anonymous trial API requests now use a best-effort per-IP rate limit for
  pre-assessment, flashcards, and quiz endpoints.
- John AI Coach replies are now repaired/replaced server-side if a model reply
  contains Japanese/CJK, Korean, Arabic, Cyrillic, or other forbidden scripts.
- Login page labels, actions, and feature chips use the shared ID/EN dictionary.
- The authenticated platform header no longer repeats the "Platform Console"
  title/subtitle block.

### Tested

- UAT OK.
- `npx tsc --noEmit --pretty false`
- `npm test`
- `npx eslint proxy.ts lib/nexus/nihongo-trial.ts app/apps/nihongo/layout.tsx components/apps/nihongo/NihongoSidebar.tsx app/apps/nihongo/pre-assessment/page.tsx app/api/apps/nihongo/flashcards/route.ts app/api/apps/nihongo/pre-assessment/profile/route.ts app/api/apps/nihongo/pre-assessment/submit/route.ts`

## [vNext] - Nexus Kingdom Retaliation Visibility

### Fixed

- Target Battle no longer hides most kingdoms behind a six-item preview. The
  scrollable target list now shows every returned target across continents.
- Target scouting prioritizes kingdoms that recently attacked the current user,
  so revenge targets stay visible even when many kingdoms exist.
- Incoming attack notification now has a direct `Serang balik` action.

### Tested

- `npm run validate:game`
- `npm test`
- `npx tsc --noEmit`
- `npm run build`

## [vNext] - Dynamic Conversational English (DCE) and John AI Coach

### Added

- Added Dynamic Conversational English (DCE) module under Nexus AI English. Full CEFR curriculum across A1-A2 (Foundation), B1-B2 (Intermediate), and C1 (Advanced) with 6 topic modules, ~200+ practice questions across reading passages, listening scripts, vocabulary gap-fills, grammar drills, model dialogues, and AI roleplay.
- Added DCE routing under `/apps/english/dce`: overview, level pages, and per-module lesson client with 7 tabs (Overview, Reading, Listening, Vocabulary, Grammar, Dialogue, Roleplay).
- Added John, an AI English conversation coach (male, 40s persona), at `/apps/english/john`. Supports text chat and push-to-talk voice with CEFR level picker.
- Added John roleplay deep-link from DCE lesson pages — opens John pre-loaded with persona, scenario, and goal pulled from the curriculum.
- Added `/api/apps/english/john` chat endpoint mirroring the Nihongo tutor pattern (OpenAI gpt-4.1-mini, fallback reply, analytics, quota guard).
- Added `/api/apps/english/dce/roleplay` endpoint that generates the opening line for a scripted scenario in the chosen persona's voice.
- Added 6 AI personas (barista, tourist, project manager, support agent, CEO, diplomat) mapped to CEFR levels for roleplay practice.
- Added `JohnAvatar` component with `/john.png` rendering and a CSS gradient fallback so John never appears as a broken image.
- Added John voice profile to `/api/voice/speak`. Endpoint now accepts `voiceProfile: "aichan" | "john"`. John uses ElevenLabs `ELEVENLABS_JOHN_VOICE_ID` (falls back to shared voice) or OpenAI `onyx` with mid-40s mentor instructions.
- Added new `/apps/english/interview` route hosting the existing Interview Practice client. The English dashboard at `/apps/english/dashboard` is now a hub with three feature cards (Interview, DCE, John).

### Improved

- Updated the Nexus AI English dashboard to a full hub experience: feature cards for Interview Practice, DCE Curriculum, and John Conversation, plus a quick-jump grid of all CEFR levels.
- Updated the Interview Practice "Back" link from "Back to Platform" to "Back to English Hub" for consistency with DCE and John pages.
- Hardened John system prompt with strict English-only language policy. John refuses to mirror non-English input (Japanese, Chinese, Korean, etc.) and instead politely redirects the learner to try the same idea in English with a starter phrase.
- Added strict scope boundaries to John, free-chat Ai-chan, and lesson-context Ai-chan tutors. All three now refuse out-of-scope requests (coding, math homework, general essays, business/medical/legal/financial advice, news, recipes, itineraries, general knowledge) and pivot back to language practice. Off-topic content is allowed only as raw material for language drills.

### Tested

- `npx tsc --noEmit`
- `npx eslint app/apps/english app/api/apps/english components/apps/english lib/english/dce app/api/apps/nihongo/tutor/route.ts app/api/apps/nihongo/lessons/[lessonId]/tutor/route.ts`

## [vNext] - Assessment Clarity and Pronunciation Scoring

### Added

- Added unanswered-question navigation for pre-assessment, JLPT N5 mock test, and JLPT N4 mock test. If learners try to continue or submit with missing answers, the UI now names the first incomplete question and scrolls to it.
- Added temporary pronunciation analysis for pre-assessment recordings. Audio is transcribed in-memory with OpenAI speech-to-text when `OPENAI_API_KEY` is configured, then scored against the target Japanese text.
- Added pronunciation scoring output for accuracy, estimated fluency, overall pronunciation score, missing tokens, likely misread tokens, Indonesian feedback, and recommended practice.

### Improved

- Reading assessment questions now render the actual target question below the passage, so learners are not left with only a generic instruction.
- N5/N4 reading seed questions now use clearer question targets and statement-matching distractors.
- AI-generated reading guardrails now reject vague reading prompts and require target-specific questions with Japanese evidence in the explanation.

### Fixed

- Removed persistent pronunciation audio storage from the assessment flow. Recorded/uploaded audio is no longer written to `public/uploads` or saved in the database.
- Sanitized pronunciation submission payloads so `audioUrl`, public URLs, data URLs, blobs, and base64 audio cannot be persisted with assessment results.
- Added validation against generic reading instructions and invalid particle-answer generation.

### Tested

- `npx tsx prisma/seed-assessment-questions.ts`
- `npm run lint`
- `npx tsc --noEmit --pretty false`
- `npm test`
- `npm run build`

## [vNext] - Nihongo N4 Rehearsal and Quiz Quality Upgrade

### Added

- Added JLPT N4 full rehearsal at `/apps/nihongo/full-rehearsal-n4` with the same section flow and scoring pattern as the existing N5 rehearsal.
- Added JLPT N4 mock test page and API at `/apps/nihongo/mock-test/n4`, backed by a 1000-question N4 question bank.
- Added N4 mock readiness support and seeded N4 mock sections across Moji-Goi, Bunpo, Dokkai, and Chokai.
- Expanded beginner quiz coverage beyond kana into vocabulary, kanji, grammar, and conversation.

### Improved

- Reworked quiz concept questions toward higher-signal grammar, kanji, comprehension, and sociolinguistic traps in Indonesian explanations.
- Added harder N3 kanji concept questions with visually similar distractors and context-based answer selection.
- Shortened sidebar labels to `Rehearsal N5` and `Rehearsal N4` so the navigation stays readable.
- Stabilized Nihongo sidebar/theme rendering and Nexus Kingdom modal effects for the current Next.js/React compiler rules.

### Fixed

- Removed the UTF-8 BOM from the N4 module JSON so Next.js can import the file during build.
- Avoided answer-leaking beginner prompts where the correct option was already named in the question text.
- Fixed React lint blockers caused by synchronous effect state updates and render-time ref reads.

### Tested

- `npm run lint`
- `npx tsc --noEmit --pretty false`
- `npm test`
- `npm run validate:game`
- `npm run validate:n5-rehearsal`
- `npm run validate:community`
- `npm run build`

## [vNext] - Nexus Kingdoms Mobile Legends Revamp

### Added

- **Per-level castle PNG art (10 tiers)**. `lib/game/castle-stages.ts`
  catalog (Reclaimed Frontier → Bamboo Outpost → Wooden Hold → Stone
  Hamlet → Walled Village → Stone Bastion → Samurai Keep → Castle Town
  → Great Fortress → Imperial Citadel) wired to PNGs in
  `public/Castle/`. `CastleVisual.tsx` swaps the old SVG silhouettes
  for proportional, full-bleed castle artwork with `quality={95}` and
  bottom-aligned `object-contain`.
- **Hero PNG with mystic float**. `public/Hero/*.png` rendered
  bottom-left of the castle frame, animated with `hero-float-bounce`
  (Ai-chan style 4s cycle), surrounded by colored radial aura, dashed
  rune ellipses, three pulsing sparks, and aura-tinted drop-shadow.
  Aura color follows hero (cyan / rose / emerald / violet / amber).
- **Hero rename + lore**. ARJUNA → Arujin Veyra (Celestial Archer),
  BIMA → Bymarax Khor (Brutal Warlord), GATOTKACA → Gatara Veyon (Sky
  Guardian), SRIKANDI → Syrakane Noxa (Shadow Tactician), SEMAR →
  Semarion Eldra (Ancient Sage). Stored `heroKey` is unchanged so DB
  data is portable.
- **One-time hero selection ritual**. New `HeroSelectionModal` (block
  on first game entry) shows a 5-card picker with image preview,
  attack / defense bonuses, and the current random assignment
  highlighted. Once confirmed via `POST /api/game/hero/select`, the
  pick is locked permanently (`GameKingdom.heroSelectedAt`).
- **Random hero on kingdom creation**. `getOrCreateGameKingdom` now
  picks a random hero from the 5-strong roster instead of defaulting
  every newcomer to ARJUNA.
- **Continent overflow at capacity 5**. `assignContinent()` caps each
  base continent at 5 inhabitants. When all five are full, new
  arrivals overflow into Roman-numeral variants (`Akatsuki Plains II`,
  `Garuda Highlands II`, ...) that reuse the same banner image via
  `getContinentBaseName`.
- **Cross-continent battle always open**. `attackKingdom` no longer
  gates cross-continent attacks behind castle level 5; `getTargets`
  shows up to 60 kingdoms from any continent. The Target Battle panel
  now reads "Semua benua terbuka — pilih lawanmu".
- **Real attack mechanics with troop casualties**. New
  `casualtyPercentsForRatio` (5–50% scaling with power ratio) plus
  `computeCasualties` decrements `quantity` and `defenseQuantity` on
  both attacker and defender `GameArmyUnit` rows inside the attack
  transaction. Per-unit losses are persisted to
  `attackerCasualtiesJson` / `defenderCasualtiesJson` on
  `GameBattleLog`.
- **`AttackNotificationModal`** — defender-side popup shown when the
  user opens the game with unseen `GameBattleLog`s. Lists attacker
  name / continent / castle level / time, ATK vs DEF, total troops
  lost, looted resources per type, and per-unit before→after
  breakdown. Acknowledged via `POST /api/game/battle/ack` which sets
  `defenderSeenAt`. Backed by new `GET /api/game/battle/incoming`.
- **`BattleReportModal`** — sophisticated post-attack report with
  result-tier theming (gold for `MAJOR_WIN` / `FULL_DAMAGE`, emerald
  for `NORMAL_WIN`, cyan-violet for `MINOR_WIN`, rose-slate for
  `ATTACKER_LOSS`), narrative copy per tier, paired Power Cards, loot
  grid with steal-percent badge, attacker + defender casualty blocks,
  and a sparkle field on victory.
- **`BattleToast` interactive notifications**. Slide-in toast stack
  (`toast-slide-in` 280ms) for shield, cooldown, invalid-target, and
  generic errors. Tone-themed (cyan / amber / violet / rose), icon
  badge, hover-pause progress bar, manual dismiss, contextual detail
  ("Shield {nama} aktif sampai dalam X menit (HH:MM)") replacing the
  old top banner error string.
- **Continent banner backgrounds**. `lib/game/continents.ts` maps each
  continent name to one of `public/Akatsuki plains.png`,
  `public/Garuda Highlands.png`, `public/Tsukikage Isles.png`,
  `public/Mahendra Desert.png`, `public/Arjuna Frostlands.png` plus an
  accent gradient and tagline. The hero card banner uses `next/image`
  fill + dark gradient overlay; each Target Battle row also flashes a
  masked sliver of its continent image.
- **Mobile Legends-flavoured dashboard repaint**. Dark navy / indigo
  gradient panels, gold-amber upgrade button, hex unit avatars
  (`UnitAvatar` with locked state), glowing accent rings on `Panel`,
  rank badges with castle tier number, resource tiles with emoji
  icons.

### Changed

- `BattleActionError` class added to `lib/game/service.ts` so the
  attack route returns `{ error, code, meta }` instead of an unstyled
  string. Codes: `INVALID_TARGET`, `SHIELD_ACTIVE`,
  `COOLDOWN_ACTIVE`. (The old `CONTINENT_LOCKED` was removed because
  cross-continent attack is now always open.)
- Schema: `GameBattleLog.attackerCasualtiesJson`,
  `defenderCasualtiesJson`, `defenderSeenAt` (migration
  `20260508120000_battle_casualties_seen`); `GameKingdom.heroSelectedAt`
  (migration `20260508140000_hero_selected_at`).
- `lib/game/public-config.ts` exports `publicHeroCatalog` (5 hero
  cards with image, aura, attack / defense bonus, best-for copy) so
  the selection modal can render without leaking server config.
- Mobile responsiveness pass on every game surface: `CastleVisual`
  frame steps from `h-64` (compact) to `h-[22rem] sm:h-[26rem]
  lg:h-[30rem]`, hero scales `h-56 → h-[18rem] → sm:h-[22rem] →
  lg:h-[26rem]`. `BattleReportModal`, `AttackNotificationModal`, and
  `HeroSelectionModal` outer overlays use `items-start sm:items-center
  overflow-y-auto` with `my-auto` on the inner card so tall reports
  scroll cleanly on small phones. Action rows stack vertically below
  `sm`. Continent banner h1 ramps `text-2xl → sm:text-4xl →
  lg:text-5xl`.

### Tested

- `npx tsc --noEmit` (clean once `.next/` cache is dropped — the dev
  server caches a stale Prisma client which can throw "Unknown
  argument `heroSelectedAt`" until the chunk is rebuilt).
- Manual QA: hero selection lock, attack causes proportional troop
  loss + resource loot, defender sees popup on next entry, shield /
  cooldown errors render as toasts, cross-continent target visibility,
  6th continent inhabitant lands on overflow variant.

### Known Limitations

- Continent variants (`Akatsuki Plains II`, ...) reuse the base
  banner image — there are no unique illustrations per variant yet.
- Hero selection cannot be reset by users; only DB intervention can
  clear `heroSelectedAt`. By design.
- Power computation still uses deterministic 0.95 variance; no random
  battle dice yet.

## [vNext] - Fast MVP AI Conversation Voice

### Added

- **Push-to-talk voice on the AI Tutor page**. New `TutorVoicePanel`
  client component with a six-state machine (idle / recording /
  transcribing / thinking / speaking / error), animated mic pulse,
  animated dots, friendly retry messaging, and a Repeat button.
- **`POST /api/voice/transcribe`** — multipart audio in, `{ text }`
  out via OpenAI Whisper. Validates session, caps payload at 5 MB,
  rejects unsupported MIMEs.
- **`POST /api/voice/speak`** — `{ text }` in, `audio/mpeg` out.
  Tries ElevenLabs first when `ELEVENLABS_API_KEY` and
  `ELEVENLABS_VOICE_ID` are set, falls back to OpenAI
  `gpt-4o-mini-tts`. Caps text at 1200 characters.
- **`mode: "voice"` for the AI Tutor endpoint** — when set, the
  system prompt gains a spoken-style suffix asking for short
  flowing replies, gentle mid-reply corrections, and a
  one-sentence follow-up question. Text mode is unchanged.
- **5 voice conversations/day quota** for trial learners, tracked
  via `FeatureUsage.VOICE_CONVERSATION` (counted per successful
  transcribe). Admins bypass the quota.
- **AI Tutor chat persistence + keyword analytics**. Every tutor
  turn (free chat + lesson chat, text + voice) now writes its user
  message and assistant reply into `AnalyticsEvent.metadata`. No
  schema migration. Two new admin panels at
  `/platform/admin/analytics` extract and display the top keywords
  from learner questions and from Ai-chan's replies via a
  multilingual tokenizer (Indonesian + Japanese particle stop-words,
  kanji/hiragana/katakana boundary splitting; no kuromoji
  dependency).
- `.env.example` documenting `OPENAI_API_KEY`,
  `OPENAI_TRANSCRIBE_MODEL`, `OPENAI_TTS_MODEL`,
  `OPENAI_NIHONGO_TTS_VOICE`, `ELEVENLABS_API_KEY`,
  `ELEVENLABS_VOICE_ID`, `ELEVENLABS_MODEL_ID`.

### Changed

- `app/apps/nihongo/tutor/page.tsx` now renders `TutorVoicePanel`
  in the right rail. Voice transcripts are appended to the same
  chat history as text messages so existing scroll, copy, and
  styling apply unchanged.
- `lib/nexus/access-policy.ts` exports
  `decideVoiceConversationAccess` and a
  `VOICE_CONVERSATION_DAILY_LIMIT` constant.
- `lib/nexus/access-guards.ts` exports `canUseVoiceConversation`
  and the `VOICE_CONVERSATION_FEATURE` key.

### Tested

- `npx tsc --noEmit`
- `npm test` (6 tests)
- Manual QA checklist documented in
  `app/admin/architecture/RELEASE_NOTES.md` under
  RN-2026.05.07-002.

### Known Limitations

- No DB schema change. Voice messages flow through the existing
  chat append path; if we later want to filter voice from text in
  transcripts, store a `metadata.voice` flag on a future
  chat-message column.
- The Whisper hint defaults to `language: "ja"` which improves
  Japanese accuracy but may slightly degrade pure-Indonesian
  utterances. Tune via `OPENAI_TRANSCRIBE_MODEL` env if needed.

## [vNext] - Nihongo Theme Toggle, DESIGN.md, Billing + Listening Hotfixes

### Added

- 3-state theme toggle in the Nexus AI Nihongo header: Nexus (default,
  warm cream + persimmon), Squid (dark + pink), Rockstar (black +
  yellow). Persisted in `localStorage` under `nihongo-theme`. Scoped
  to the `/apps/nihongo` route — Platform and Admin shells stay on
  the existing palette.
- `docs/DESIGN.md` — in-house Nexus design system (~600 lines)
  synthesized from references for Claude (warm AI tutor), Intercom
  (chat / Aichan), Notion (curriculum), ElevenLabs (Voice + Listening
  surfaces), and PostHog (Admin Analytics surface only).
- `[data-theme="nexus"]` override block in `app/globals.css` that
  translates the project's slate/cyan/blue Tailwind utilities into
  the sumi-cream + persimmon palette without editing any component.

### Changed

- Replaced `next-themes` with a minimal in-house React Context provider
  so the theme attribute can stay on a wrapper div inside the Nihongo
  layout instead of `<html>` — the previous setup tripped a Next.js 16
  console warning about inline `<script>` tags inside React components.
- Squid override now flips `bg-slate-950` (the project's primary-CTA
  convention) to brand pink `#ED1A7F` and Rockstar flips it to brand
  yellow `#FCAF17`. Primary actions now match the active theme accent
  on every page instead of staying dark and disappearing.
- Inside Rockstar's yellow primary surface, slate text steps and the
  Progress bar visuals are flipped to dark variants via descendant
  selectors so the Progress panel passes AA contrast.
- Sidebar decorations are now theme-aware: number markers in Nexus,
  ○ △ □ rotation in Squid, ★ stars in Rockstar; faint corner
  watermark shapes appear only in the dark themes.

### Fixed

- Manual billing proof upload no longer hangs on the loading spinner.
  The handler at `/api/platform/billing/payments/[paymentId]/proof`
  now stores the uploaded image as a base64 data URL on the
  `PaymentProof.fileUrl` row instead of writing to
  `public/uploads/...` which is read-only on Vercel Functions. The
  client wraps the upload in try/catch/finally and reads the response
  body as text first so non-JSON error pages don't leave the UI stuck.
- Nexus AI Nihongo Listening pages now display the Indonesian
  translation when the toggle is on. The parser at
  `lib/nihongo/listening.ts` is now tolerant of `indonesia` /
  `indonesian` / `id` / `translation` / `terjemahan` keys nested in
  either `{ indonesia: [...] }` objects or per-line array shapes
  (`[{ japanese, romaji, indonesia }]`).

### Tested

- `npx tsc --noEmit`
- `npm test` (6 tests passed)
- Manual UAT: theme toggle, billing upload, listening Indonesian
  toggle.

### Known Limitations

- Existing `PaymentProof` rows whose `fileUrl` was a `public/uploads/...`
  path are unrecoverable on Vercel — those bytes never persisted past
  the original cold start.
- Storing proof images as base64 data URLs inflates row size up to
  ~6 MB. If proof volume grows, migrate to Vercel Blob in a follow-up.

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
