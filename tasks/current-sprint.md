# Current Sprint

Last consolidated: 2026-07-14 JST

## Sprint Goal

Build a reliable long-term project memory system so future AI coding sessions can understand Nexus Platform quickly and avoid repeating past mistakes.

## Active Work

- Consolidate project documentation into `AGENTS.md`, `docs/`, and `tasks/`.
- Preserve historical release/architecture knowledge without breaking `/admin/architecture`.
- Identify duplicate, outdated, missing, and contradicting documentation.
- Establish canonical entry points for project state, roadmap, known issues, deployment, database, and coding standards.
- StoryArc migration, authenticated progression, and the published-content visual-novel player are validated. All 27 episodes are selectable; the former School Gate proof no longer terminates the primary flow. The July 15 presentation pass replaces the pseudo-rig with 18 expression/gesture poses, introduces Indonesian-school core environments and hijabi student designs, and maps each named speaker to a stable age-appropriate cached TTS profile. StoryArc TTS stays on one pinned OpenAI-first path, normalizes WAV loudness before caching, invalidates old mixed-provider cache entries, and assigns separate youthful voices to School Core A/B dialogue turns. Product-owner-approved pitch mitigation is now female student `1.11` and male student `1.08`, with adults unshifted and student cache regeneration isolated behind `storyarc-voice-v5-teen-pitch`. Published School Core lessons are clickable and run listening, practice/rationale, production, story-link, and mastery-check blocks. The player exposes previous review inside the scene and completion state. Replay persists its checkpoint reset and lets previously rewarded choices advance with zero duplicate reward; legacy local-only replay state recovers implicitly.
- StoryArc content repair, semantic validation, safe ingestion, and explicit owner-authorized lifecycle publication are complete for all 90 items. Obtain academic/audio/accessibility/IP review, verified CP identifiers, and production-quality audio before calling the catalog editorially approved.
- Keep StoryArc at NOT READY until curriculum-mastery-aware John adaptation, certified mastery/Exam-attempt persistence, controlled timing, final audio approval, physical mobile profiling, and interrupted-network behavior have working automated and browser evidence. Basic StoryArc Conversation with AI John is implemented with shared John identity/voice, English-only guards, StoryArc access isolation, and an atomic five-request daily quota. TOEIC direct-listening placeholder answers and per-question playback are repaired. Part 1 photo-description items now display proportional original fictional Indonesian-school photographs, play only descriptions A-D, keep option text hidden until review, and never expose author image briefs. Question–Response also uses audio-only answer choices before review, while conversation/talk transcripts unlock after checking; all listening sections still require formal academic/audio/accessibility approval.
- Validate the new StoryArc Classroom LMS: role-aware Teacher/Student navigation, owned grade/section classes, registered learner enrollment/join codes, published-content assignments, progress records, hard Exam Lab release-time drip guards, durable objective assignment scores, and per-learner teacher monitoring/grade entry.
- Validate StoryArc Digital Library Release 1: existing PostgreSQL documents remain dual-readable; new teacher-owned PDF uploads up to 50 MB use expiring upload intents and direct private Vercel Blob signed PUTs; completion verifies metadata and bounded PDF signature bytes; learner downloads use class-authorized signed GETs; deletion removes the Blob before metadata. Production cutover still requires the dedicated private store environment and preview verification.
- **Out-of-sprint exception, explicitly requested by the product owner**: Nexus AI Nihongo's post-login app shell was redesigned — 224px sidebar replaced with a fixed bottom nav (`NihongoBottomNav.tsx`) on every breakpoint, top header slimmed to one row, and the dashboard rebuilt as a single-column "story mode" home. `docs/DESIGN.md` bumped to `version: 2`. A latent `rockstar` theme contrast bug (invisible white text on light-mint "completed" cards) was fixed in `app/globals.css` at the same time. This is feature code, not documentation, so it is tracked here as a deliberate exception to this sprint's "no feature code changed" scope rather than silently folded into it.

## Next Engineering Focus After Docs

- Mobile recording compatibility.
- Single active session monitor/visibility.
- Database-backed admin analytics expansion.
- Ai-chan assistant reminder evolution.
- Payment UAT and production deployment safety hardening.

## Required Verification For This Sprint

- Documentation files exist in the target structure.
- `AGENTS.md` gives future agents the required reading order.
- `docs/context-audit-report.md` captures audit results.
- No feature code is changed as part of this sprint.
