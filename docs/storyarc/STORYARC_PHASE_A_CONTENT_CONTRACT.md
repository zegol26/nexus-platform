# StoryArc Phase A Content Contract

Status: implementation contract for the small Phase A fixture and future Step 4 authoring. This contract does not authorize generating or importing the 90 production items.

## Technical source of truth

- Zod schema and cross-reference validator: `lib/storyarc/content/schema.ts`
- Import transaction: `lib/storyarc/content/importer.ts`
- Lifecycle policy: `lib/storyarc/content/lifecycle.ts`
- Small non-production example: `lib/storyarc/content/foundation-fixture.ts`
- Prisma identity/workflow/evidence/state models: `prisma/schema.prisma`
- Admin dry-run/import route: `POST /api/admin/apps/storyarc/content/import`
- Admin preview route: `GET /api/admin/apps/storyarc/content/:contentId/preview`
- Admin lifecycle route: `PATCH /api/admin/apps/storyarc/content/:contentId/lifecycle`
- Student published-only route: `GET /api/apps/storyarc/content/:contentId`

## Package identity

Every package must declare:

- `schemaVersion: "storyarc.content.v1"`
- `appSlug: "storyarc"`
- a unique kebab-case `packageId`
- a `releaseTarget`
- one curriculum source/version declaration
- competency and learning-objective catalogs
- asset manifest entries
- one or more item revisions

## Enums and identifiers

- Grades: `GRADE_10`, `GRADE_11`, `GRADE_12`
- Tracks: `SCHOOL_CORE`, `STORY_MODE`, `EXAM_LAB`
- Phases: `PHASE_E`, `PHASE_F`
- Skills: `LISTENING`, `SPEAKING`, `READING`, `WRITING`, `GRAMMAR`, `VOCABULARY`
- Content kinds: `LEARNING_ITEM`, `ASSESSMENT`, `VOCABULARY`, `EXPRESSION`
- Evidence intent: `EXPOSURE`, `PRACTICE`, `ASSESSED_EVIDENCE`, `RECALL_EVIDENCE`
- Lifecycle: `DRAFT -> VALIDATING -> IN_REVIEW -> APPROVED -> PUBLISHED -> SUPERSEDED/ARCHIVED`
- Stable IDs use lowercase kebab-case. A revision identity is `stableId + revision`; an existing revision number with different content is a conflict, never an overwrite.

Grade/phase validation is strict: Grade 10 maps to Phase E; Grades 11 and 12 map to Phase F. This is a project mapping only until verified CP identifiers are supplied by the academic lead. Claude must not invent official curriculum identifiers.

## Item requirements

Each item declares stable ID, positive revision, kind, grade, track, phase, title, one primary skill, at most two supporting skills, at least one objective key, source metadata, and a validated immutable payload. Canonical payloads always set:

- `runtimeGeneration: false`
- `instructionLanguage: "id"`
- `targetLanguage: "en"`

Story Mode items require a scene manifest with stable arc/episode/scene/location IDs, declared assets, an entry dialogue node, reachable dialogue references, choices, and at least one hotspot. Choices use the communication dimensions and interaction classifications defined in `STORYARC_DIALOGUE_DESIGN_RULES.md`.

Vocabulary and expressions use separate stable namespaces. An unlock records exposure only. A future recall hook declares its source entry and objective; a later item may reference that hook. Recall becomes mastery-eligible only when it is rubric-backed `RECALL_EVIDENCE`.

## Import behavior

1. Submit the complete package with `dryRun: true`.
2. Fix every error; warnings remain visible to reviewers.
3. Submit the identical package with `dryRun: false`.
4. Import runs in one Prisma transaction.
5. New immutable revisions enter `DRAFT`; unchanged hashes are reported as unchanged; revision-number/hash conflicts fail the package.
6. Admins advance valid revisions through the lifecycle. Student routes query `PUBLISHED` only.

Malformed packages are rejected before any write. Validation covers schema values, grade/phase compatibility, duplicate item revisions, duplicate competencies/objectives, competency/objective references, Story Mode scene presence, dialogue edges/dead ends, asset references, expression/vocabulary recall sources, and recall-hook references.

## Step 4 Claude instructions

Claude must use this file plus the actual Zod schema and the approved product/design docs. Claude should produce JSON compatible with the example fixture, but must wait for the missing approved `STORYARC_CONTENT_MANIFEST` and `STORYARC_EXAM_BLUEPRINT` before producing the 90-item catalog or Exam Lab definitions. The technical importer—not prose examples—is authoritative when a shape differs.
