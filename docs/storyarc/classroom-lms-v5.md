# StoryArc Classroom LMS v5

## Delivered scope

StoryArc now has a class-and-assignment layer that reuses the canonical published content catalog and its existing learner runtimes. It does not copy lesson or exam payloads into assignments.

## Roles and boundaries

- `SUPER_ADMIN` and `ADMIN` can view and manage every StoryArc class.
- `TEACHER` can create and manage only classes where `teacherId` is their user ID.
- `USER` is the learner role and can join a class by join code or be enrolled by a teacher using an already registered email.
- The admin Users page can promote an ordinary learner account to `TEACHER` (shown as Guru) or return a teacher to learner. Admin roles cannot be changed through that narrow control.
- Every server mutation rechecks the current session and class ownership. UI visibility is not the authorization boundary.

## Data logic

- `StoryArcClass` identifies a grade and section such as Grade 10 / A and owns a unique join code.
- `StoryArcClassMember` links an existing registered learner to a class; no duplicate learner account is created.
- `StoryArcAssignment` references one immutable `PUBLISHED` `StoryArcContentRevision`, plus title, instructions, release time, and optional deadline.
- `StoryArcAssignmentProgress` records per-learner `ASSIGNED`, `IN_PROGRESS`, or `COMPLETED` state plus optional score numerator, denominator, percentage, source, and timestamp. Existing assignments are backfilled when a learner joins; existing members receive progress when a task is created.

Exam Lab assignments persist an objective score only after all scored sections are checked. Story and School Core completion does not manufacture a score; the teacher can enter a 0–100 grade. The teacher dashboard shows every learner per assignment, completion status, score source, completion count, and class average. Learners see only their own status and score, using `Not graded` when no valid assessment exists.

## Drip and Exam Lab rules

`availableFrom` is the hard drip boundary. An enrolled learner sees only assigned Exam Lab revisions. Before release the card shows the release time but not its sections, question count, questions, answers, or rationale. The individual Exam route rechecks the assignment and schedule, so manually entering a URL cannot bypass the lock.

Learners without a class retain the open published catalog for backward compatibility. Teachers and admins retain the full published catalog. A deadline currently marks work overdue but does not prevent review or completion.

## Digital Library

StoryArc now includes a class-private Digital Library. Release 1 preserves `StoryArcClass` and `StoryArcClassMember` as the authorization boundary. Existing PDF/DOC/DOCX records remain `DATABASE` documents and retain the authenticated PostgreSQL byte-range reader. New uploads are PDF-only and capped at 50 MB: the server authenticates the teacher/admin, validates class ownership and declared metadata, reserves a server-generated document ID/pathname in an expiring upload intent, then issues a short-lived private signed PUT so the browser sends the binary directly to Vercel Blob. Completion authenticates again, verifies exact pathname/size/content type/private host and a bounded `%PDF-` signature range, then creates one metadata-only `VERCEL_BLOB` row idempotently. New Blob documents use short-lived authorized signed GET URLs in the original PDF reader, so neither upload nor download binary crosses a Nexus Function. Learners remain limited to active enrolled classes in their grade. Malware scanning, intent/orphan reconciliation, parsing/indexing workers, and existing-file backfill are explicitly outside Release 1.

## Campus Arcade presentation

The desktop StoryArc shell uses the approved Campus Arcade concept: a persistent game-style left rail, functional navigation panels including Digital Library, player/XP/currency status, brighter mission cards, and responsive mobile navigation. The Story route follows the approved reference composition directly: episode timeline header, dual-character center stage, attached pixel-style dialogue, large two-column choice cards, and a dedicated right rail for previous-episode review, live quest progress, playable vocabulary, and selectable expression chips. Hana and Ryo use newly generated, close-up Indonesian school character poses together in the Story player. Character-specific placement profiles normalize their different source-canvas aspect ratios and visible alpha bounds so Ryo and Hana retain comparable head/torso scale above the dialogue panel on desktop and mobile. The portraits are synthetic fictional characters with no real-person identity reference, as declared in the asset manifest and asset policy. All scene backgrounds remain location-specific through the existing visual registry.

## Verification and release boundary

The implementation includes policy tests for drip states and runtime deep links, Prisma validation/generation, TypeScript validation, database synchronization, and browser verification. Assignment gradebook scores are durable, but a full immutable Exam-attempt and rubric-evidence system remains a separate release gate. This feature does not change the existing production readiness verdict: academic approval, final voice approval, accessibility/art/IP review, certified attempt scoring, and physical mobile profiling remain separate gates.
