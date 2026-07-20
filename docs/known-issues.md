# Known Issues

## High Priority

- Mobile recording compatibility is incomplete for iPhone Safari, mobile Chrome, permission-denied states, MIME fallback, and playback headers.
- Production deploy and alias changes are high risk unless candidate URL, Vercel project, domain owner, env, checkout, CSRF, auth, and sandbox payment are verified first.
- Manual proof images are stored as base64 data URLs; large volume will inflate database size.
- Listening audio is stored as database data URLs for MVP; large audio libraries need object storage.
- StoryArc Digital Library Release 1 moves new PDF uploads (up to 50 MB) to direct private Vercel Blob transfer with short-lived signed PUT/GET URLs while preserving existing PostgreSQL `fileData` documents through dual-read. The production project still requires a dedicated private Blob store connection and its environment variables before cutover. Upload completion verifies Blob metadata and a bounded `%PDF-` signature range, but malware scanning, expired-intent/orphan reconciliation, existing-document backfill, and full processing/indexing workers remain future work.
- StoryArc's former Step 5 content defects are repaired and all 90 release items were lifecycle-published on explicit product-owner instruction. That operational publication does not constitute academic/audio/accessibility/IP approval; nine official CP mappings remain unverified and the local Microsoft-voice MP3 assets remain temporary.
- StoryArc Step 6 remains NOT READY for a production product release: the visual novel, linear learner sequence, in-player previous review, Quest Journal, School Core lessons, separate A/B lesson voices, normalized/pinned runtime TTS, four-mode Exam Lab runtime, direct-listening playback, and basic StoryArc John conversation are implemented. Curriculum-mastery-aware John adaptation, certified mastery/Exam-attempt persistence, controlled attempt timing, and final approved audio are not implemented.
- StoryArc Classroom now persists assignment gradebook scores, including objective Exam Lab auto-scores and teacher-entered overrides. It still lacks immutable multi-attempt history, rubric-scored constructed responses, and assessor feedback. Deadlines flag overdue work but intentionally allow late review/completion; class archiving, learner removal, and teacher reassignment are not yet exposed in the UI.

## Product Limitations

- Nexus Kingdom continent variants reuse base banner images.
- Hero selection is intentionally one-time and cannot be reset by users without DB/admin intervention.
- Battle variance remains deterministic.
- Community is polling-based MVP, not realtime.
- Reading completion uses `AnalyticsEvent`, not a dedicated progress table.
- AI-generated personalized reading remains architected but not broadly expanded.

## Documentation Debt

- Release notes exist in both `docs/release-notes.md` and `app/admin/architecture/RELEASE_NOTES.md`.
- Architecture docs exist in canonical `docs/architecture.md` and admin-rendered `app/admin/architecture/NEXUS_ARCHITECTURE.md`.
- `docs/DESIGN.md` is Nihongo-specific, while the archived root design file was an external Claude reference and not a Nexus source of truth.

## Technical Debt

- Admin pages are functional but need richer search/filtering as data grows.
- Trial/access guard discipline must be maintained for every new feature.
- Direct client-triggered learning rewards need server-side validation before adversarial use.
- Seed scripts must stay idempotent to avoid production data loss.
- StoryArc John voice is isolated by the explicit `storyarc-john` context, English STT, John TTS profile, English-only history scope, StoryArc entitlement, and a separate five-request WIB-day quota. Physical mobile microphone testing and final voice editorial approval remain required.
- The former Phaser School Gate scene remains as a foundation proof but is no longer the primary Story runtime. The layered React visual-novel scene now covers all nine canonical locations and seven named NPCs through a 27-episode direction registry, with reduced-motion behavior. It still needs physical low-end Android profiling, interrupted-network/audio checks, formal art/IP/accessibility approval, and expression-specific production sprite sheets or a real skeletal-rig format before production approval.
- Nexus AI Nihongo's shell (layout + bottom nav + dashboard) was redesigned to a minimalist "story mode" style, but the content-level redesign of the remaining pages (curriculum lesson detail, quiz, flashcards, tutor, reading, listening, rehearsal, mock test) has not been done — they still render their prior denser card styling inside the new shell. `components/apps/nihongo/NihongoSidebar.tsx` and `components/layout/MobileSidebarDrawer.tsx` are now unused (no longer imported by `app/apps/nihongo/layout.tsx`) and should be deleted in a follow-up pass once confirmed unreferenced elsewhere.
