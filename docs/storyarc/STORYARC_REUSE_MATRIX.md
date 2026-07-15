# StoryArc Reuse Matrix

Classification is based on repository code as of 2026-07-14. “Extract shared” means preserve the proven policy or shape while removing app/language coupling before StoryArc uses it.

| Capability | Classification | Repository evidence and decision |
| --- | --- | --- |
| Authentication | **REUSE AS-IS** | `lib/auth/auth-options.ts`, `lib/auth/single-session.ts`, and server layouts already enforce login, JWT role propagation, idle expiry, and single-session policy. StoryArc needs no parallel identity stack. |
| User profile | **REUSE WITH SMALL ADAPTER** | `User` already owns name, avatar, goal, and reminders in `prisma/schema.prisma`; StoryArc grade/phase preferences must be app-domain data, not more generic `User` columns. |
| App registration | **REUSE WITH SMALL ADAPTER** | Add StoryArc to `lib/platform/app-registry.ts` and seed/upsert `PlatformApp`; preserve the existing route/discovery convention. |
| Entitlement | **REUSE AS-IS** | `AppUserAccess`, `lib/platform/access.ts`, and app server layouts are app-neutral. Add a StoryArc layout that checks slug `storyarc`. |
| Payment activation | **REUSE AS-IS** | `lib/platform/activate-subscription.ts` activates access by `appId` and is already app-neutral and transactional. |
| Progress | **EXTRACT SHARED LEARNING PRIMITIVE** | Nihongo uses `NihongoLessonProgress`, PMP uses `PmpLessonProgress`, Arabic reconstructs from `AnalyticsEvent`, and DCE has no durable progress. Create app-scoped item attempts/completion rather than another incompatible counter. |
| Quiz | **EXTRACT SHARED LEARNING PRIMITIVE** | Nihongo quiz routes and English DCE validators contain reusable answer validation and feedback patterns, but their content/state is app-specific (`app/api/apps/nihongo/quiz/route.ts`, `lib/english/dce/validation.ts`). |
| Assessment | **EXTRACT SHARED LEARNING PRIMITIVE** | `NihongoAssessmentSession/Answer`, mock attempts, and `EnglishInterviewReview` prove session/item/score patterns. None provides app-neutral skill evidence or versioned rubric lineage. |
| Vocabulary | **STORYARC-SPECIFIC IMPLEMENTATION** | `NihongoFlashcard` fields and seeded content are Japanese-coupled. StoryArc vocabulary/expression unlocks need canonical content IDs, encounter state, and recall evidence. |
| Flashcard | **EXTRACT SHARED LEARNING PRIMITIVE** | Reuse review scheduling/answer semantics after extraction; do not reuse `NihongoFlashcard` as an English table. Current schema has no learner review history. |
| Reading | **EXTRACT SHARED LEARNING PRIMITIVE** | Reading UI/progress event patterns are useful, but `ReadingPassage` has `contentJa`, kanji, romaji, and translation fields. StoryArc reading content must be language-neutral at the core. |
| Listening | **REUSE WITH SMALL ADAPTER** | Reuse playback, byte-range response, transcript validation, and admin metadata validation. Replace database data URLs and Japanese-coupled `ReadingPassage` ownership. Evidence: `components/nihongo/ListeningPracticeClient.tsx`, `app/api/admin/listening/*`, English DCE sanity scripts. |
| Curriculum | **STORYARC-SPECIFIC IMPLEMENTATION** | `NihongoLesson` and TypeScript-only English DCE do not express grades 10–12, tracks, arcs, publish revisions, or 90/180 rollout. Preserve validators, not storage models. |
| Lesson | **STORYARC-SPECIFIC IMPLEMENTATION** | StoryArc needs canonical published item revisions and runtime composition. Do not add English fields to `NihongoLesson`. |
| AI Tutor | **TECHNICAL DEBT / REPAIR FIRST** | There is no provider/context abstraction, and shared `canAskAiTutor()` hardcodes Nihongo access/usage. Create an app-scoped AI context boundary before StoryArc calls a model. |
| John | **REUSE WITH SMALL ADAPTER** | Reuse identity, English-only policy, voice profile, and coaching style from `lib/english/john-*`; give StoryArc a distinct course/context and do not share browser history with Nexus AI English. |
| English Interview | **REUSE WITH SMALL ADAPTER** | Recorder capability checks, authenticated uploads, playback headers, admin review, and skill scoring are reusable for Exam Lab speaking tasks. Replace interview-specific entities and base64 storage. |
| PTT | **TECHNICAL DEBT / REPAIR FIRST** | `JohnVoicePanel` and `TutorVoicePanel` duplicate recorder logic; the shared server quota is Nihongo-bound. Extract one recorder and explicit voice context after mobile compatibility repair. |
| STT | **TECHNICAL DEBT / REPAIR FIRST** | `/api/voice/transcribe` defaults to Japanese and resolves only exact John identity; it also checks Nihongo entitlement for John. Reject unknown voice context and use app-owned policy. |
| TTS | **REUSE WITH SMALL ADAPTER** | `/api/voice/speak` already selects named voice profiles and supports ElevenLabs/OpenAI fallback. Require an explicit allowed StoryArc profile and app access; never accept the current Ai-chan default for StoryArc. |
| TTS cache | **REUSE WITH SMALL ADAPTER** | `VoiceTtsCache` keys include profile plus text hash and supports authenticated byte ranges. Add policy/version/model dimensions and move audio bytes to object storage before scale. |
| Badges | **EXTRACT SHARED LEARNING PRIMITIVE** | `NihongoBadge` is language/app-specific. Badge definition, award ledger, and evidence reference can be generic; StoryArc badge catalog remains StoryArc content. |
| Achievements | **STORYARC-SPECIFIC IMPLEMENTATION** | `UserGameProfile.achievementsJson` derives Kingdom achievements from counters. StoryArc quests/relationships/story achievements need authoritative event references and must not change mastery. |
| Certificate | **REUSE WITH SMALL ADAPTER** | `CourseCertificate` and certificate ID policy are app-neutral. Add StoryArc program metadata and compute eligibility from canonical completion, not XP. |
| Admin | **REUSE WITH SMALL ADAPTER** | Reuse `/admin`, `requireAdmin()`, tables, and access conventions. StoryArc needs new editorial screens and roles/state transitions because existing content admin lacks review/approval/publish revisions. |
| Analytics | **REUSE WITH SMALL ADAPTER** | Reuse `AnalyticsEvent`, `trackEvent`, and route metrics for engagement. Always set `appSlug: "storyarc"`; mastery changes must use a dedicated evidence ledger, not analytics metadata. |

## Top five safe reuse assets

1. `lib/auth/auth-options.ts` plus `lib/auth/single-session.ts` — shared identity/session enforcement.
2. `AppUserAccess` plus `lib/platform/access.ts` — app-neutral entitlement and expiry policy.
3. `lib/platform/activate-subscription.ts` — transactional payment-to-access activation.
4. `lib/english/john-language-policy.ts` — deterministic English-only response guard.
5. `lib/english/dce/validation.ts` — content-quality checks for questions, answers, transcripts, audio references, and answer distribution.

## Explicit non-reuse boundaries

- Do not reuse `NihongoLesson` as the StoryArc lesson table.
- Do not reuse `ReadingPassage` as StoryArc English reading storage.
- Do not call `start-ai-lesson` or generate canonical content during learner runtime.
- Do not share `NihongoLessonTutorMessage` or Nexus AI English browser history with StoryArc.
- Do not let Phaser call Prisma, payment providers, OpenAI, ElevenLabs, or database-backed admin APIs directly.
- Do not map Story XP, quests, relationship points, or dialogue choices to English mastery without assessed or recall evidence.
