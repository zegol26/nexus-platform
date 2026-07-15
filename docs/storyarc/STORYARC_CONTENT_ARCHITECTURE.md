# StoryArc Content Architecture

## Decision

StoryArc canonical lessons and scenes are authored or generated before learner runtime, validated, reviewed, approved, and published as immutable revisions. Opening a lesson never calls a content-generation model.

The repository has reusable validators/import patterns but no complete editorial lifecycle. `app/api/apps/nihongo/lessons/[lessonId]/start-ai-lesson/route.ts` generates content on learner open and is explicitly excluded from StoryArc.

## Canonical lifecycle

```text
Generation or authoring
→ Draft revision
→ Deterministic validation
→ Human review
→ Approval
→ Publish immutable revision
→ Student runtime
→ Archive/supersede without deleting history
```

Generation is optional and offline/admin-controlled. AI output is never considered reviewed because it passed a schema.

## Reusable repository assets

- `lib/english/dce/types.ts`: structured English reading, listening, vocabulary, grammar, dialogue, and roleplay shapes.
- `lib/english/dce/validation.ts`: count, duplicate, option, answer distribution, transcript, audio-reference, and rationale checks.
- `lib/nihongo/lessons/validateLessonContent.ts`: deterministic required-section validation pattern.
- `prisma/seed-english-interview.ts` and other source-key upserts: stable import identity pattern.
- `app/api/admin/listening/upload/route.ts`: multipart metadata normalization and server validation.
- PMP admin routes: `requireAdmin()`-protected create/update and `isActive` examples.

These are patterns, not a ready StoryArc lifecycle.

## Content storage split

### Relational identity/workflow

Expected future records:

- content item identity: stable ID/slug, track, grade, current published revision;
- content revision: version, state, schema version, content hash, payload, created by/at;
- validation run: validator version, result, errors/warnings, run by/at;
- review/approval: reviewer, approver, decision, comment, timestamp;
- publication: release ID, publish/retire times, replaced revision;
- asset references: manifest asset IDs and versions.

### Structured revision payload

Store editorial structures as validated JSON rather than one table per dialogue line:

- School Core lesson blocks;
- Exam Lab item definitions and rubric references;
- Story arcs/episodes/scenes/dialogue graphs/choices/hotspots;
- quest definitions and display rewards;
- vocabulary/expression definitions;
- scene asset references and preload hints.

Stable relational IDs are required wherever learner attempts, evidence, progress, or player state create references.

## State machine

Allowed transitions:

- `DRAFT → VALIDATING`;
- `VALIDATING → DRAFT` on errors;
- `VALIDATING → IN_REVIEW` on clean validation;
- `IN_REVIEW → DRAFT` for requested changes;
- `IN_REVIEW → APPROVED` by an authorized reviewer/approver policy;
- `APPROVED → PUBLISHED` through release publication;
- `PUBLISHED → SUPERSEDED` when a newer revision is published;
- `PUBLISHED/SUPERSEDED → ARCHIVED` only when retention rules allow.

Published payload is immutable. Editing creates a new draft revision.

## Import and generation contract

Structured import supports JSON packages with:

- package/schema version;
- product and app slug `storyarc`;
- release target;
- item stable IDs and revision numbers;
- grade/track/arc/unit/episode metadata;
- objectives, competencies, skills, rubrics;
- structured lesson or scene payload;
- asset manifest references;
- source/generator metadata;
- content hashes.

Import runs in dry-run mode first and reports creates, revisions, unchanged items, conflicts, errors, warnings, and release-count totals. It must be idempotent by stable ID plus revision/content hash. It must not delete user-visible or historical content.

AI generation records provider/model, prompt template version, input brief, output hash, timestamp, and operator. Secrets and full provider credentials are never stored. Human review remains mandatory.

## Validation gates

Every candidate release validates:

- exact initial/target item totals and grade/track distribution;
- unique stable IDs and monotonic revisions;
- supported schema version;
- required learning objectives and competency mappings;
- valid assessment answers/rubrics and explanation quality;
- dialogue graph reachability, terminal paths, and no orphan nodes;
- quest/choice references and idempotent reward identifiers;
- vocabulary/expression references and recall mappings;
- English-only StoryArc learner content where policy requires it;
- no prohibited IP names, unlicensed asset references, or missing provenance;
- all asset IDs exist, hashes match, and first-scene budget passes;
- captions/transcripts/alt text/reduced-motion variants exist where required;
- no learner-runtime AI generation flag;
- no route path embedded as the only identity.

Warnings can block publication by release policy. The current English validators demonstrate warnings for missing rationales and manual audio review; StoryArc release policy must decide which warning codes are blocking.

## Student runtime

Runtime queries only a published immutable revision. It never reads a draft, approved-unpublished payload, seed source file, or generated candidate.

Attempts and saves store the exact revision ID. When a new revision publishes:

- new starts use the new revision;
- in-progress attempts follow a declared compatibility policy;
- completed attempts retain the historical revision reference;
- mastery evidence remains reproducible against the original rubric.

## Release strategy for 90 then 180 items

The initial release is one validated content release containing 90 items. Later releases add revisions/items through import/admin workflow. React code does not change merely because item counts grow from 90 to 180.

Release reports show:

- total and per-grade counts;
- track allocation;
- validation status;
- asset volume and first-scene budgets;
- new/changed/superseded item list;
- reviewer/approver identities;
- rollback target.

## Administration

Reuse the `/admin` shell and `requireAdmin()`; add StoryArc-specific catalog, revision editor/import, validation report, review queue, approval, release, and archive views. Separate content editors/reviewers/approvers through an explicit authorization decision; current `UserRole` does not encode those workflow roles.

## Seed policy

StoryArc content may use a bootstrap importer in development, but production catalog changes use reviewed releases. Any seed remains idempotent and non-destructive, following `docs/database.md` and the production seed incident in `docs/lessons-learned.md`. No StoryArc seed should call `deleteMany()` on catalog or learner data.
