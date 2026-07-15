# StoryArc Open Decisions

Product unknowns are recorded here rather than resolved by architecture guesswork.

## Blocking before shared schema design

| Decision | Why it blocks | Owner needed |
| --- | --- | --- |
| Indonesian curriculum authority and competency framework for SMA/SMK Grades 10–12 | Determines phase, objective, competency, assessment, and reporting taxonomy | Product + academic lead |
| Meaning of `Phase` and relationship to grade/semester | Determines content identity/filter/report fields | Academic lead |
| Definition of one “learning item” across three tracks | Determines 90/180 counting, completion, release validation, and pricing claims | Product + academic lead |
| Mastery scale, proficiency bands, evidence weighting, recency, difficulty, and minimum evidence | Determines projector algorithm and certificate/readiness claims | Academic lead + data/engineering |
| Whether AI-scored speaking/writing can be summative and its human-review threshold | Determines rubric, audit, appeals, and evaluator storage | Academic/assessment lead |
| Certificate eligibility for StoryArc | Determines completion/mastery threshold and certificate program metadata | Product + academic lead |

## Blocking before content administration

| Decision | Why it blocks | Owner needed |
| --- | --- | --- |
| Who may create, review, approve, publish, archive, and roll back | Current `UserRole` does not model editorial separation | Operations + security |
| Which validator warnings block publication | Current English validators allow review warnings | Academic/content operations |
| In-progress learner behavior after a revision publishes | Determines pin-to-revision versus migration policy | Product + academic lead |
| Content retention and deletion policy | Historical attempts require immutable referenced revisions | Legal/operations |
| Generation provider/model governance and prompt retention | Determines provenance, reproducibility, and cost/security | Product + AI/security |

## Blocking before voice/AI implementation

| Decision | Why it blocks | Owner needed |
| --- | --- | --- |
| StoryArc John UI/scaffolding language: English-only UI or Indonesian guidance with English speech | Determines context registry and prompt/output policy | Product + academic lead |
| Handling of Indonesian learner speech in English practice | Determines STT acceptance and coaching behavior | Academic lead |
| Transcript, conversation, and voice retention period | Determines data model/storage/privacy controls | Legal + operations |
| Whether StoryArc John shares the existing visual/voice character asset | Requires IP/voice-license confirmation and character consistency | Product + legal |
| Per-plan AI/STT/TTS quotas and attribution | Determines app-scoped `FeatureUsage` policy | Product + finance |

## Blocking before Phaser production approval

| Decision | Why it blocks | Owner needed |
| --- | --- | --- |
| Approved low-end Android device/profile and browser floor | Performance cannot pass without a test target | Product + engineering/QA |
| First-scene JS/asset/memory/interaction budgets | Determines Phaser approval gate | Engineering + product |
| Orientation policy: portrait, landscape, or responsive both | Determines camera/UI/asset composition | Game design + UX |
| Offline scope and resume guarantee | Determines cache/service-worker/state conflict design | Product + engineering |
| Accessibility target beyond reduced motion/captions | Determines alternate interactions and content requirements | Product + accessibility |

## Blocking before asset production

| Decision | Why it blocks | Owner needed |
| --- | --- | --- |
| Object storage/CDN provider and private/public delivery model | Current base64/local storage is not suitable for StoryArc scale | Infrastructure + finance |
| Original-art commissioning/generation workflow and rights approval | Required for commercial provenance | Product + legal/content |
| Hana, Ryo, and John character bibles | Prevents visual/personality drift and accidental IP similarity | Creative lead |
| Music/SFX/voice licensing and attribution policy | Required before any audio publication | Legal + creative lead |
| Asset/source retention and contract-reference system | Determines manifest and audit storage | Legal + operations |

## Non-blocking until later release planning

- Relationship value visibility to learners.
- Whether story choices can be replayed and under what reset policy.
- Cross-grade New Game Plus or arc replay behavior.
- Social/community sharing of achievements.
- Seasonal events beyond the canonical 180 items.
- Whether StoryArc narrative achievements appear in Nexus Kingdoms; default architecture keeps them separate unless a future server-owned integration is approved.

## Confirmed decisions from the brief

- StoryArc is a separate Nexus application.
- It does not replace or break existing English, Nihongo, Arabic, PMP, auth, dashboard, entitlement, or payment flows.
- Product mix is 50% School Core, 30% Story Mode, 20% Exam Lab.
- Initial release is 90 items; target is 180; no bulk items are generated in this audit.
- Story Mode is an interactive 2D/2.5D original game, not a static visual novel.
- Player progression and English mastery are separate.
- Canonical lessons are not generated when opened by a learner.
- Hana, Ryo, and John are approved concept characters; authenticated user is the player; Aki is not hardcoded.
- Copyrighted anime characters, backgrounds, music, and unlicensed images are prohibited.
- The entire season must not download before the first scene.
- Phaser is conditional on repository-specific proof and performance gates.
