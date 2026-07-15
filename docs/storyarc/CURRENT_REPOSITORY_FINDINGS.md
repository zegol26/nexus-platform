# StoryArc Current Repository Findings

> Historical Step 1 baseline. StoryArc Phase A code was added later on 2026-07-14; see `STORYARC_PHASE_A_IMPLEMENTATION_STATUS.md` for current implementation truth.

Audit date: 2026-07-14 JST
Scope: repository audit and architecture baseline only. No StoryArc runtime, dependency, schema, migration, content, deployment, or production behavior was created.

## Verdict

**Suitable with repairs.**

Nexus already provides reusable identity, paid app entitlement, payment activation, protected App Router layouts, admin authorization, analytics events, route metrics, English content validation, English interview recording, and authenticated TTS caching. It does not provide a shared learning core, a published/versioned content lifecycle, an explainable mastery ledger, or a browser game runtime. John and shared voice also retain confirmed Nihongo coupling that must be repaired before StoryArc voice or AI work.

## Repository truth

- One npm workspace is present. `package-lock.json` and the documented commands in `package.json` identify npm as the package manager.
- The application is a Next.js 16.2.4 App Router monolith using React 19.2.4 and TypeScript 5.9.3 (`package.json`, `app/`, `proxy.ts`).
- Prisma 7.8.0 uses PostgreSQL through `@prisma/adapter-pg`; `prisma.config.ts` points to the source of truth at `prisma/schema.prisma`, and `lib/db/prisma.ts` owns lazy client creation.
- There is one applicable agent handbook: `AGENTS.md` at the repository root.
- StoryArc has no existing route, registry entry, schema model, or implementation. A repository search found no StoryArc product code.
- No Phaser, Pixi, Three.js, canvas game engine, or game-runtime dynamic import exists in `package.json`, `app/`, `components/`, or `lib/`.

## Platform findings

### Identity and sessions

- `lib/auth/auth-options.ts` configures credentials authentication, JWT sessions, role propagation, and a four-hour idle limit.
- `lib/auth/single-session.ts` stores a server-side `Session`; non-admin login deletes older sessions, while admins may retain multiple sessions.
- `lib/auth/require-admin.ts` re-reads the database user and accepts only `ADMIN` and `SUPER_ADMIN`.
- Protected app layouts such as `app/apps/english/layout.tsx`, `app/apps/nihongo/layout.tsx`, `app/apps/arabic/layout.tsx`, and `app/apps/pmp/layout.tsx` validate sessions and app access on the server.

### Application registration, entitlement, and payment

- The code registry is `lib/platform/app-registry.ts`; the database catalog is `PlatformApp` in `prisma/schema.prisma`. StoryArc needs both a code registration and a database catalog row.
- `AppUserAccess` is the entitlement record. `lib/platform/access.ts` centralizes admin bypass and expiry validation.
- `lib/platform/activate-subscription.ts` atomically upserts `AppUserAccess` and `Subscription` from a paid `PaymentTransaction`.
- `SubscriptionPlan`, `Subscription`, `PaymentTransaction`, `PaymentProof`, and `AccessGrantAudit` already support paid app activation and operational audit.
- Platform dashboard/app discovery is driven by `lib/platform/app-registry.ts` plus database access in `app/platform/dashboard/page.tsx` and `app/platform/apps/page.tsx`.

### Admin and analytics

- `/admin` is protected by `app/admin/layout.tsx` and `requireAdmin()`; `/platform/admin` is a legacy access surface.
- `AnalyticsEvent` is flexible and app-scoped, but `appSlug` defaults to `nihongo` in the schema. Callers must set `storyarc` explicitly.
- `lib/analytics/trackEvent.ts` and `app/api/analytics/track/route.ts` provide server and browser event ingestion.
- `ServerRouteMetric` and `lib/observability/route-metrics.ts` aggregate route counts, latency, slow calls, and errors. They do not provide model-token traces or learning-evidence lineage.

## Learning platform findings

The repository contains several vertical learning implementations, not one shared learning platform domain.

- Nihongo curriculum and completion use `NihongoLesson` and `NihongoLessonProgress` (`prisma/schema.prisma`, `app/api/apps/nihongo/curriculum/progress/route.ts`).
- Nihongo assessment persists sessions and item-level answers in `NihongoAssessmentSession` and `NihongoAssessmentAnswer`; mock tests persist attempts and item answers.
- Nihongo flashcards, badges, tutor messages, generated lesson content, listening assets, and profile recommendations are language-coupled by names and fields.
- `ReadingPassage` is also Japanese-coupled through `contentJa`, `kanjiJson`, `romajiJson`, and `translationJson`.
- English DCE is structured TypeScript content under `lib/english/dce/`; `components/apps/english/dce/DceLessonClient.tsx` holds quiz state in React and sends analytics, but there is no durable DCE completion or mastery model.
- English interview practice persists recordings and manual skill scores through `EnglishInterviewAnswer` and `EnglishInterviewReview`.
- Arabic completion is reconstructed from `AnalyticsEvent`; PMP has its own `PmpLessonProgress`.
- Certificate policy is shared at `lib/certificates/policy.ts`, but `lib/certificates/eligibility.ts` has app-specific branches and currently returns zero completion for English.
- Nexus Kingdoms XP and achievements are stored in `UserGameProfile` and `GameKingdom`. `lib/gamification/kingdom.ts` directly maps learning actions to XP; it does not model English mastery.

Result: StoryArc must not extend `NihongoLesson`, `NihongoLessonProgress`, `NihongoFlashcard`, `UserNihongoProfile`, or `ReadingPassage` with English fields. The reusable opportunity is to extract policies, validation shapes, evidence semantics, and app-scoped services.

## AI findings

- There is no provider abstraction. Routes and generators instantiate the OpenAI SDK directly, including `app/api/apps/english/john/route.ts`, `app/api/apps/nihongo/tutor/route.ts`, Arabic tutor routes, PMP routes, and Nihongo generators.
- Models and prompts are route-local. John uses `gpt-4.1-mini`; voice transcription defaults to `whisper-1`; TTS defaults to `gpt-4o-mini-tts` when ElevenLabs is unavailable.
- John browser history is sent by `components/apps/english/john/JohnChatClient.tsx`; the server takes ten validated turns and filters non-Latin-script turns through `scopeJohnHistoryToEnglish()`.
- John conversation content is not stored as a dedicated conversation model. `app/api/apps/english/john/route.ts` writes truncated user and assistant text into `AnalyticsEvent.metadata`.
- Nihongo lesson tutor history is persisted in `NihongoLessonTutorMessage`; this model and its prompts are Japanese-coupled.
- `FeatureUsage` is the cost/quota primitive, but current shared guard helpers hardcode `appSlug: "nihongo"`.

## Confirmed John voice request flow

1. `components/apps/english/john/JohnVoicePanel.tsx` obtains microphone audio with `navigator.mediaDevices.getUserMedia()` and records through `MediaRecorder`.
2. The client selects the first supported MIME type from WebM/Opus, WebM, MP4, MPEG, or Ogg, creates a blob, and posts it to `/api/voice/transcribe`.
3. The multipart request includes `tutorId=john`, `courseId=english-john`, `inputLanguage=en`, `outputLanguage=en`, and the browser locale from `navigator.language`.
4. `app/api/voice/transcribe/route.ts` authenticates, checks the voice quota, resolves the trusted server configuration only from `tutorId`, and selects `JOHN_TUTOR_CONFIG.inputLanguage` (`en`). Client-supplied language values are not used to choose STT language.
5. The route sends the audio to OpenAI transcription with `language: "en"`, checks the result for Japanese-script density, increments voice usage, and returns text.
6. `JohnVoicePanel` calls `JohnChatClient.handleVoiceTranscript()`. `JohnChatClient` posts the transcript, CEFR level, roleplay persona, and browser-held history to `/api/apps/english/john`.
7. `app/api/apps/english/john/route.ts` filters history with `scopeJohnHistoryToEnglish()`, builds an English-only John prompt, calls OpenAI, repairs a forbidden-script response once, then applies `enforceJohnEnglishOnly()`.
8. The client posts the reply to `/api/voice/speak` with `voiceProfile=john` and `returnUrl=true`.
9. `app/api/voice/speak/route.ts` builds a cache key from voice profile plus text hash, selects John-specific ElevenLabs/OpenAI voice configuration, and stores generated audio in `VoiceTtsCache`.
10. The client fetches `/api/voice/speak/cache/[cacheKey]`, creates an object URL, and plays it after an explicit user action.

## English-to-Japanese leakage findings

### Confirmed repaired path

The current John UI sends `tutorId=john`; the STT route then forces English. Tests in `tests/policies.test.ts` verify the John language configuration and history filter. The John server prompt and output repair reject Japanese and other forbidden scripts. The TTS cache key includes `voiceProfile`, so identical text for John and Ai-chan does not share an audio row.

### Confirmed remaining coupling

- `app/api/voice/transcribe/route.ts` sets `DEFAULT_TRANSCRIBE_LANGUAGE = "ja"`. Any current or future client that omits an exact `tutorId=john` is transcribed as Japanese.
- `components/apps/nihongo/TutorVoicePanel.tsx` omits tutor identity by design and therefore depends on the Japanese default. This makes the shared route context-implicit.
- The STT route calls `canUseVoiceConversation()` from `lib/nexus/access-guards.ts`. That helper resolves only Nihongo entitlement and writes usage with `appSlug: "nihongo"`. John voice therefore depends on Nihongo access/quota despite its English layout enforcing English entitlement.
- `app/api/apps/english/john/route.ts` calls `canAskAiTutor()` from the same Nihongo guard module and increments `FeatureUsage` under Nihongo. John text is also cross-entitled and misattributed.
- The TTS route defaults an unrecognized or missing profile to `aichan`. John currently sends `john`, but a missing profile in future StoryArc code would select Nihongo voice instructions.
- `app/api/voice/speak/route.ts` requires login but does not validate app entitlement or increment a TTS-specific usage counter. StoryArc must not expose this route without an app/context policy.
- `clientLocale`, submitted input/output language values, global `LanguageProvider`, and document locale do not control server STT. This prevents global UI locale from causing the current John defect, but the unused form fields create a misleading contract.

Required repair: replace default-based shared voice routing with a validated server-owned context object containing `appSlug`, `tutorId`, `courseId`, `inputLanguage`, `outputLanguage`, `voiceProfile`, and quota feature. Reject unknown contexts. Do not fall back across apps.

## Existing English findings

- `app/apps/english/layout.tsx` is a sound server-side entitlement boundary.
- DCE provides strong authored content types and validators in `lib/english/dce/types.ts` and `lib/english/dce/validation.ts`, with 1,875 questions checked by the baseline validator.
- John provides usable English persona/prompt/output-policy assets in `lib/english/john-tutor-config.ts` and `lib/english/john-language-policy.ts`.
- English interview provides mobile-aware recording capability checks, MIME fallback, authenticated upload, byte-range playback, admin grouping, and manual scoring.
- DCE state is not durable; English interview audio is stored as base64 in PostgreSQL; John quotas use Nihongo access; certificate eligibility has no English completion calculation.

## Content administration findings

- Nihongo catalog content is primarily seeded from `prisma/seed-*.ts` and `prisma/data/`.
- `lib/nihongo/lessons/validateLessonContent.ts` and `lib/english/dce/validation.ts` demonstrate deterministic validation before storage/release.
- `app/api/apps/nihongo/lessons/[lessonId]/start-ai-lesson/route.ts` can generate and persist a lesson template when a learner opens it. This violates the StoryArc canonical-content requirement and is classified **DO NOT REUSE**.
- Listening has authenticated upload/upsert/delete through `components/admin/ListeningManagerClient.tsx` and `app/api/admin/listening/*`, but it stores audio as a database data URL.
- PMP exposes admin-authenticated create/update APIs with `isActive`, but its admin pages are catalog views rather than a complete editorial workflow.
- No common fields or services represent draft, validation result, reviewer, approver, publish time, immutable revision, rollback, or archive.
- `isActive` is not a substitute for an editorial lifecycle.

## File and asset findings

- `public/` contains 30 PNG files totaling 49,227,288 bytes, 42 MP3 files totaling 7,429,632 bytes, 6 WebM files totaling 1,870,898 bytes, and 14 SVG files totaling 30,799 bytes.
- Existing hero PNGs range up to 3.47 MB and castle PNGs up to 2.70 MB. Shipping comparable unoptimized assets in one StoryArc preload would violate the low-end Android requirement.
- `next.config.ts` permits one external image hostname and has no object-storage/CDN asset host for StoryArc.
- There is no asset manifest carrying author, source, license, commercial-use status, attribution, checksum, dimensions, or scene ownership.
- Database base64 is used for `VoiceTtsCache`, English interview recordings, manual payment proof images, and listening uploads. Repository documentation already marks this as MVP-only storage.

## Top five technical risks

1. Cross-app language, entitlement, and usage leakage through Nihongo-hardcoded AI/voice guards and Japanese/Ai-chan defaults.
2. No append-only, rubric-referenced evidence ledger, so English mastery changes are not causally explainable.
3. No immutable Draft/Review/Approval/Publish content revisions; current learner-open generation is incompatible with StoryArc canonical content.
4. Existing local/base64 asset storage and multi-megabyte PNG patterns cannot support scene-scoped low-end Android delivery at StoryArc scale.
5. Phaser compatibility is unmeasured in this Next.js 16 repository; lifecycle, bundle isolation, mobile memory, context loss, and interrupted save/resume remain proof gates.

## Expected future database impact

No migration was created. A later authorized implementation is expected to add:

- stable StoryArc content item identities, immutable content revisions, validation/review/approval/publication records, and release membership;
- app-neutral learning attempts, completion, append-only evidence, mastery projections, and projection-change lineage;
- StoryArc player snapshot plus idempotent/auditable state transitions for checkpoint, quest, relationship, Story XP, and achievements;
- learner vocabulary/expression encounter, unlock, practice, and recall state;
- asset manifest/provenance records pointing to durable object storage;
- optional app/context-aware AI conversation/usage records if `AnalyticsEvent` and current `FeatureUsage` are insufficient.

Existing `User`, `PlatformApp`, `AppUserAccess`, subscription/payment models, `CourseCertificate`, and route metrics should be reused. Existing Nihongo/English/PMP data should not be renamed or repurposed. Schema details remain subject to the decisions in `STORYARC_OPEN_DECISIONS.md`.

## Test and build baseline

Executed on 2026-07-14:

- `npx tsc --noEmit --pretty false`: pass.
- `npm run lint`: pass with 0 errors and 10 warnings. Warnings are seven `no-img-element` findings and three unused-variable findings.
- `npm test`: pass; 13 policy tests plus English DCE regression checks.
- `npm run validate:game`: pass.
- `npm run validate:community`: pass.
- `npm run validate:n5-rehearsal`: pass.
- `npm run sanity:english-listening`: pass with 26 review warnings and no failures.
- `npm run sanity:english-questions`: pass with 174 review warnings and no failures.

Not executed:

- `npm run build` because `scripts/build.mjs` can run `prisma migrate deploy` and, outside production/Vercel, `prisma db seed`. Running it would violate this audit's no-migration/no-behavior-mutation boundary.
- Browser tests because no Playwright/Cypress configuration or StoryArc route exists.
- CI inspection found no `.github/workflows`; `vercel.json` only pins region `sin1`.

## Audit limitations

- No production database rows, Vercel deployment, payment provider, OpenAI account, ElevenLabs account, or live browser session was inspected.
- Asset copyright provenance cannot be established from file names alone.
- No bundle analyzer was run and Phaser was not installed, so the StoryArc bundle budget remains a proof-of-concept gate.
- No low-end Android device profile, iOS Safari session, interrupted-network simulation, WebGL context-loss test, or accessibility test was run.
- The audit establishes expected future schema impact; it does not validate a migration against production data.
