# StoryArc Phase A Implementation Status

Updated: 2026-07-14 JST.

Phase A acceptance status: PASS in the local development environment. No production deployment was performed.

The Step 1 repository audit remains historical evidence and is now stale where it states that StoryArc has no route, models, registry entry, dependency, or runtime. Phase A adds those foundations without changing existing Nihongo/English voice routes.

Implemented:

- `storyarc` platform registration, plans/seed access, protected shell, six navigation areas, and admin content entry;
- curriculum source/version, competency/objective, immutable content revision, attempts/evidence/mastery lineage, player snapshot/transition, and unlock schema;
- strict package validation, transactional import, lifecycle transitions, published-only learner reads, and admin preview;
- separate player progression and mastery eligibility policy;
- explicit `storyarc-john` language context definition, not yet connected to voice/STT/TTS;
- lazy Phaser 4 client host and an original procedural School Gate proof scene;
- server-authoritative state commands with state versioning and idempotent rewards.
- semantic action prerequisites that prevent fresh-key Story XP replay, plus a database foreign key from player transitions to their published source revision;
- a canonical database release report (`npm run report:storyarc-canonical`) and readable mobile dialogue/hotspot controls backed by the published scene payload.

Validated locally:

- Prisma format/validate/generate, TypeScript, lint (zero errors), unit/regression tests, repository validators, and a production build;
- unauthenticated `/apps/storyarc` access redirects to `/login?callbackUrl=%2Fapps%2Fstoryarc` without browser console errors;
- the StoryArc migration, platform seed, and targeted foundation seed against local PostgreSQL;
- authenticated navigation, published fixture bootstrap, admin dry-run validation, dialogue/quest/relationship/unlock saves, duplicate transition rejection, scene transition, browser refresh, and authoritative resume at `courtyard-arrival`;
- a 390 x 844 responsive-browser journey with no horizontal overflow, 44–66 px touch controls, choice/sign/gate persistence, and no browser console errors;
- the StoryArc Phaser bundle is route-lazy (1,381,688 raw bytes; 357,892 gzip in the final local build) and the procedural first-scene asset payload is zero external image/audio bytes.

Still outside Phase A or awaiting later approval:

- production Phaser approval remains conditional until a real low-end Android/browser run and bundle/device budgets pass;
- the full historical John/Nihongo PTT coupling is unchanged;
- mastery weighting/bands are not invented; only eligible evidence and causal schema are implemented;
- editor/reviewer/publisher role separation remains unresolved;
- object storage and production art/audio pipelines are not implemented;
- the Exam Blueprint, Content Manifest, and nine 90-item package files are now present, but Step 5 release validation fails; see `STORYARC_STEP5_CONTENT_VALIDATION_REPORT.md`.
- the historical Phase A-only runtime has been superseded: the canonical database now contains 90 published release items, and the primary Story route runs the 27 Story episodes through the layered visual-novel player with authenticated progression and cached dialogue TTS;
- the Step 6 production release gate remains NOT READY because interactive StoryArc John coaching, complete character/location/final-voice coverage, rubric-backed mastery projection, detailed School Core lessons, and the four working Exam Lab modes are not implemented.
