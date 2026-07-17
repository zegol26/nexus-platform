# Project State

Last consolidated: 2026-07-14 JST

## Current Product State

Nexus Platform is a multi-app learning platform for Nexus Talenta Indonesia Academy. It has public academy/checkout/legal pages, authenticated platform dashboard, billing, community, Nexus Kingdoms game, admin console, and app workspaces for Nihongo, English, Arabic, and PMP.

The codebase is a Next.js 16 App Router app using TypeScript, Prisma 7, PostgreSQL, NextAuth credentials auth, OpenAI, optional ElevenLabs, Midtrans, Nodemailer, and Vercel.

## Completed Features

- Public academy surface with landing, login, register, checkout, terms, refund policy, contact, and overview-trial pages.
- Platform shell with dashboard, programs, apps, billing, settings, community, and game entry.
- Admin console for users, subscriptions, payments, settings, usage, analytics, lessons, lesson cache, readings, listening, flashcards, quizzes, recordings, PMP content, and architecture docs.
- Authentication with credentials, Prisma adapter, JWT session, single active session records, and 4-hour idle timeout.
- App access enforcement for Nihongo, English, Arabic, PMP, and internal lesson engine restrictions.
- Midtrans sandbox/production payment architecture, production mode controlled by environment, public `/payment/finish`, and canonical Monthly/Quarterly/Yearly plan catalog repair.
- Nexus AI Nihongo curriculum, AI lesson cache, AI tutor, voice conversation, reading roadmap, listening module, flashcards, quiz, JLPT N5/N4 mock tests, N5/N4 full rehearsal, pre-assessment, pronunciation scoring, badges, and theme toggle.
- Nexus Kingdoms game with castle/hero art, hero selection, cross-continent targets, retaliation visibility, battle reports, attack notifications, resource/troop mechanics, and learning rewards.
- Nexus AI English dashboard, interview practice, DCE curriculum, John AI Coach, roleplay, dual-voice listening, and validation scripts.
- Nexus AI Arabic curriculum, tutor, conversation, quiz, and progress routes.
- PMP Exam Prep dashboard, diagnostic, simulator/exam, ITTO, glossary, knowledge base, readiness, brain dump, Andromeda chat, progress, and admin content tools.
- Route metrics for Fluid CPU risk visibility and `/admin/usage`.

## Latest Release History Read

- Latest root release note: Anonymous Nihongo Trial and Documentation Consolidation, UAT OK.
- Latest admin release note: `RN-2026.06.13-001`, anonymous Nihongo trial, documentation consolidation, John English-only guard, login localization, and platform header cleanup.
- Latest specialized note: English course improvements expanded DCE sections and quality validation.
- Latest UAT/RCA note: Vercel Fluid CPU and Midtrans payment hardening, including the 2026-05-27 payment gateway regression.

## Active Work

- Documentation consolidation and durable AI-agent project memory.
- Follow-up roadmap remains focused on mobile recording compatibility, single active session monitoring/hardening, analytics from current database, and Ai-chan assistant evolution.
- Payment gateway UAT and production deployment safety remain operationally sensitive.
- Nexus StoryArc now has a protected app shell, content workflow/import contract, progression/mastery separation, explicit language context, current PostgreSQL migration/seed, and an authenticated published-content Story player. The primary Story route renders all 27 published episodes instead of stopping at the former Phase A School Gate proof scene; choice saves, semantic reward replay protection, terminal hotspots, and next-episode navigation are covered by automated and browser verification.
- StoryArc Step 5 content repair, ingestion, and owner-authorized lifecycle publication are complete locally and in the Nexus Platform production database. Production now contains exactly 90 published release items (45 School Core, 27 Story Mode, and 18 Exam Lab), 30 per grade, with zero blocking workflow revisions, duplicate stable IDs, or invalid dialogue edges. The local historical catalog also retains one superseded foundation revision. The packages pass the release-wide semantic validator with complete Exam Blueprint counts, 350/350 selected-response rationale sets, rubric/evidence bindings, corrected stable identities, 40 content-hashed temporary audio assets, and a generation report. The only validator findings are nine intentional `CURRICULUM_SOURCE_GAP` warnings pending verified CP identifiers from the academic lead.
- StoryArc Step 6 remains NOT READY for a production product release even though the catalog is published. Publication was explicitly authorized by the product owner and does not represent academic, final-audio, accessibility, or IP sign-off. The Story player resolves all 27 episodes with Indonesian environments, genuine pose switching, replay-safe progression, an in-player previous-episode control, and dedicated OpenAI-first speaker profiles whose pinned model/voice/instruction fingerprint and normalized WAV output prevent old mixed-provider volume/identity cache reuse. Product-owner-approved teenage pitch mitigation now applies to student voices only (female `1.11`, male `1.08`) with a new student cache fingerprint; adult voices remain unshifted. Learners follow the first incomplete episode in sequence, may review previous completed episodes, and no longer see the published Story map; that map is admin-only. School Core has an interactive lesson runtime with separate youthful A/B dialogue voices, Quest Journal derives its current mission and history from published episode briefs, and all 18 Exam Lab items normalize into runnable practice sections across School Exam, TOEIC-style, Interview, and Mock Exam modes. TOEIC direct-listening options and per-question audio are repaired in published revisions, and StoryArc now includes text/voice Conversation with AI John with an atomic five-request daily learner quota. Certified mastery/attempt persistence, controlled timing, curriculum-mastery-aware John adaptation, and final audio approval remain absent.
- StoryArc now includes a Campus Arcade LMS shell and a database-backed, role-aware Classroom. Login role drives Teacher Classroom versus My Assignments navigation, and both modes include a clear return to Nexus Platform. Admin can promote registered learners to `TEACHER`; teachers create grade/section classes, enroll registered learners, schedule assignments, monitor completion/score, and enter grades. Digital Library Release 1 preserves existing PostgreSQL PDF/Word records through dual-read while sending all new PDF uploads up to 50 MB directly from the browser to private Vercel Blob through server-authorized, expiring paths. Completion verifies object metadata and bounded PDF signature bytes; authorized readers receive short-lived private signed GET URLs, so new file bodies never traverse a Nexus Function. The production private store connection, malware scanning, reconciliation, processing workers, and existing-file backfill remain explicit cutover/future work. Exam Lab assignment scores persist after all objective sections are checked. Story/Lesson completion remains explicitly ungraded until a teacher score exists. Character-specific scene placement also prevents Ryo's landscape-canvas sprite from falling behind the dialogue panel. TOEIC-style Part 1 now renders original fictional Indonesian-school photographs for every photo item, speaks descriptions A-D without leaking author briefs, and hides option sentences until review.
- StoryArc admin content operations now leads with catalog health and a guarded canonical-release workflow instead of a raw JSON textarea. Admins can dry-run and idempotently publish the repository-owned 90-item release from the production runtime, while manual JSON import, revision transitions, and the published Story map remain available as secondary operational tools.
- Existing registered users can now receive or lose StoryArc entitlement from both the primary `/admin/users` console and the legacy `/platform/admin` Access Control panel, with time-bounded grants, visible expiry state, and access audit records. The Access Control app selector merges the code registry with database rows and its guarded API creates a missing recognized catalog row on first use. An additive catalog migration also guarantees the `PlatformApp.storyarc` row exists even when production intentionally skips the full seed. Mobile Story Mode framing raises both cast members above the dialogue card, with a separate Ryo offset for his wider source canvas.

## Latest Maintenance Notes

- Anonymous Nexus AI Nihongo trial is UAT OK for pre-assessment, flashcards, and quiz without login. Paid/progress-bearing Nihongo surfaces remain locked, anonymous analytics are acknowledged without persistence, and anonymous APIs use best-effort rate limits.
- Project memory has been consolidated into `AGENTS.md`, canonical `docs/`, `tasks/`, and `skills/` files while preserving the admin-rendered architecture docs.
- John in Nexus AI English now has a server-side English-only output guard. If a model reply contains Japanese/CJK, Korean, Arabic, or Cyrillic script, the API repairs or replaces it with an English coaching redirect before returning it.
- John push-to-talk now identifies the tutor as `john` and locks OpenAI speech-to-text input language to English (`en`) before the tutor prompt runs; the shared voice route still defaults to Japanese for existing Nihongo voice flows.
- Login page copy now uses the universal ID/EN dictionary for field labels, action text, and feature chips.
- Platform header no longer displays the redundant "Platform Console" title/subtitle block.

## Known Issues And Debt

- Mobile recording needs stronger browser capability checks, MIME fallback, permission messaging, and playback headers.
- Manual proof images are stored as base64 data URLs; this is stable for MVP but expensive at scale.
- Listening audio is also stored as database data URLs for MVP stability; object storage is needed for larger media libraries.
- Existing release notes are duplicated across root docs and admin-rendered docs.
- `app/admin/architecture` remains a second documentation surface because the admin page reads it directly.
- Historical production incidents show deploys and seeds can damage data if git, Vercel aliases, env, and seed behavior drift.

## Future Roadmap Items

- Mobile recording compatibility pass for English interview and shared recording utilities.
- Admin session monitor for single active session visibility.
- Database-backed analytics for growth, billing, app access, learning progress, AI usage, assessment, mock tests, reading/listening, English review throughput, and content operations.
- Ai-chan reminder evolution with per-app reminders, configurable thresholds/copy, and impression/click/dismiss tracking.
- Durable object storage for proof images and audio.
- Better production deployment runbooks and automated smoke checks.
