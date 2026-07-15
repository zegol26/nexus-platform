# StoryArc Product Architecture

## Architecture verdict

StoryArc fits the existing Next.js monolith as a separate paid application under `/apps/storyarc`, with shared Nexus identity/billing and a separate learning/game domain. The application must not be a renamed English DCE route and must not extend Nihongo tables.

## Product boundary

StoryArc is identified by:

- platform slug: `storyarc`;
- route root: `/apps/storyarc`;
- code ownership: `app/apps/storyarc`, `components/apps/storyarc`, and `lib/storyarc`;
- analytics app slug: `storyarc` on every event;
- AI context: a server-owned StoryArc course/tutor context;
- content: immutable published StoryArc revisions;
- entitlement: an ordinary `PlatformApp` plus `AppUserAccess` row.

Existing `/apps/english` remains Nexus AI English for interview preparation, DCE, and John coaching. StoryArc may reuse John’s character policy and selected English primitives through adapters, but it does not share route state, lesson state, conversation history, mastery, or catalog ownership.

## Domain ownership

| Domain | Owns | Does not own |
| --- | --- | --- |
| Nexus Platform | User, session, role, `PlatformApp`, `AppUserAccess`, plans, subscriptions, payments, access audit, shared navigation, admin authorization | Story position, mastery, lesson revisions, dialogue, game rendering |
| Shared Learning Core | Item identity, attempts, completion, evidence type, skill/rubric references, evidence-to-mastery projection contract | StoryArc narrative content, Phaser scenes, payment state |
| StoryArc Learning Domain | Grade/phase/track taxonomy, competencies, learning objectives, canonical item revisions, assessment rubrics, vocabulary/expression catalog, learner mastery projection | Global auth/payment, frame rendering |
| StoryArc Game Domain | Player save, story position, quests, relationships, choice consequences, hotspots, scene checkpoint, Story XP/level, achievements | English mastery calculation, provider calls, entitlement decisions |
| AI Services | Validated tutor context, prompt construction, history scope, STT/TTS configuration, usage attribution, output guard, provider telemetry | Canonical lesson generation at learner open, direct player-state mutation |
| Content Administration | Draft/review/approval/publish/archive workflow, structured import, validation reports, revision immutability, asset provenance | Student entitlement, direct game client writes to canonical content |

## Next.js shape

Server Components remain the default:

- `app/apps/storyarc/layout.tsx`: session and `storyarc` entitlement enforcement, following `app/apps/english/layout.tsx`.
- dashboard/catalog pages: fetch published metadata and learner summaries on the server.
- route handlers under `app/api/apps/storyarc/*`: revalidate session, app access, ownership, payload, and revision.
- small client islands: recorder, quiz interaction, dialogue UI, and the Phaser host.

The Story Mode route owns a narrow client-only runtime. The React shell fetches a server-authorized bootstrap document, mounts Phaser, and exchanges typed commands/events through a bridge. The browser never receives Prisma credentials or an authoritative mutation surface without a route handler.

## Concept placement

Do not create one table per product noun.

| Concept | Placement | Reason |
| --- | --- | --- |
| Grade | enum/config plus indexed canonical field | Stable values 10, 11, 12; needed for filtering and reporting. |
| Phase | configuration/content metadata | Curriculum planning label; promote to relational only if access/reporting depends on it. |
| Track | enum/config plus indexed canonical field | Required School Core / Story Mode / Exam Lab allocation and filtering. |
| Arc | structured versioned content with stable ID | Narrative/curriculum grouping changes with content releases. |
| Unit | structured versioned content with stable ID | Editorial grouping, not learner-owned state. |
| Episode | structured versioned content with stable ID | Story composition and scene manifest ownership. |
| Lesson / learning item | relational identity plus immutable versioned payload | Stable references for entitlement, completion, attempts, and revision audit; flexible render payload. |
| Learning Objective | structured content plus stable relational key when evidence references it | Needs traceable mapping from item/rubric to mastery. |
| Competency | relational/config catalog | Stable reporting dimension across revisions. |
| Skill Evidence | relational append-only event | Must answer why mastery changed. |
| Assessment | item configuration plus relational attempt/evidence | Authoring is content; learner results are transactional. |
| Vocabulary / Expression | canonical versioned catalog plus learner encounter/recall state | Definitions are content; unlock/recall is user state. |
| Story Scene / Dialogue / Choice | structured versioned content | Branching payload is editorial and revisioned; avoid row explosion. |
| Quest definition | structured versioned content | Canonical objective/reward rules ship with story revision. |
| Player State | relational snapshot plus append-only transition/idempotency record | Save/resume and authoritative mutation require user-owned transactional state. |
| Relationship | compact per-player relational state or JSON snapshot with typed keys | Small mutable game state; not learning mastery. |
| Vocabulary Unlock | append-only player/content event plus current projection | Needs provenance and idempotency. |
| Expression Recall | assessed/recall evidence event | This can affect mastery only when rubric-scored. |
| Mastery Evidence | append-only relational record | Required causal lineage, audit, recomputation, and dispute handling. |

## Application request boundaries

1. Server layout verifies session and StoryArc access.
2. Server reads published item identity/revision and the learner projection.
3. React renders School Core/Exam Lab or loads the Story Mode bootstrap.
4. Browser interaction posts a typed command with item revision, attempt ID, and idempotency key.
5. Server validates access, ownership, current state, canonical rules, and payload.
6. Server transaction writes attempt/completion/evidence or game transition.
7. Server returns a new projection plus display-safe events.
8. Analytics records engagement separately from authoritative learning/game state.

## Product allocation invariant

Published releases must validate exact track/grade counts:

- target: 180 items = 90 School Core, 54 Story Mode, 36 Exam Lab;
- initial: 90 items = 45 School Core, 27 Story Mode, 18 Exam Lab;
- initial per grade: 30 items for Grade 10, 30 for Grade 11, 30 for Grade 12.

These counts belong in release validation and reporting, not in hardcoded React routes. Additional content is imported and published as new revisions.

## Compatibility protections

- Existing app slugs and hrefs remain unchanged.
- StoryArc access checks use `storyarc`, never `english` or `nihongo`.
- StoryArc does not write Nihongo progress, DCE browser state, English interview rows, or Kingdom reward counters.
- Shared voice and AI repairs are backward-compatible: Nihongo receives an explicit Ai-chan context before the Japanese default is removed.
- Shared learning extraction begins with adapters so current route behavior remains stable while new primitives are introduced.
