# Drip Content and Classroom LMS Mechanism

This is the reusable Nexus contract for StoryArc and future class-based learning apps.

## Roles and visibility

| Capability | Admin | Teacher | Student |
| --- | --- | --- | --- |
| Manage all classes | Yes | No | No |
| Manage owned classes | Yes | Yes | No |
| Assign published content | Yes | Yes, owned classes | No |
| View roster monitoring | Yes | Yes, owned classes | No |
| Enter or override score | Yes | Yes, owned classes | No |
| View assignments | Operational view | Owned classes | Own enrollment only |
| View scores | Operational view | Owned learners | Own score only |
| Manage class library | Yes | Yes, owned classes | No |
| Open class documents | Operational view | Owned classes | Enrolled classes only |

The authenticated database role drives both navigation and page behavior. UI branching improves clarity, but every server mutation and protected query must independently verify the session, role, class ownership, enrollment, assignment, and schedule.

## Canonical data contract

- `Class`: grade, section, teacher owner, active state, and unique join code.
- `ClassMember`: existing registered learner linked to a class.
- `Assignment`: class, immutable published content revision, creator, title, instructions, release time, optional deadline.
- `AssignmentProgress`: assignment, learner, status, timestamps, optional score numerator/denominator/percentage, score source, and scored timestamp.
- `LibraryDocument`: class, uploader, subject, title, teacher summary, private storage reference or bounded file payload, MIME type, size, and timestamps.

Assignments reference canonical published content. They do not copy lesson, story, exam, rationale, rubric, or audio payloads.

## Drip state machine

```text
now < availableFrom          -> LOCKED
availableFrom <= now <= due  -> OPEN
due < now                    -> OVERDUE
```

`LOCKED` is a hard authorization boundary. List pages may reveal the assignment title and release time, but must not reveal protected questions, answers, rationale, sections, or direct runtime content. The runtime route repeats the same guard so URL manipulation cannot bypass it.

`OVERDUE` is not automatically blocked. Late submission, review-only access, and teacher extension are explicit product policies and must not be conflated with release locking.

## Completion and score

Completion answers “Did the learner finish the workflow?” Score answers “What evaluated result was recorded?” They are separate fields.

- Objective Exam Lab work may auto-score after every scored section is checked.
- Persist `score`, `maxScore`, computed `scorePercent`, source `EXAM_LAB_AUTO`, and `scoredAt`.
- Constructed response, story, and lesson tasks remain ungraded until a rubric engine or teacher score exists.
- A teacher score uses a 0–100 contract, source `TEACHER`, and may override an auto-score after ownership and membership checks.
- A learner “Mark complete” action must never invent a percentage.
- Reopening work may change status but should preserve the historical score unless a deliberate resubmission policy replaces it.

## Required learner experience

- Sidebar label reflects the learner role, such as `My Assignments`.
- The learner sees class, teacher, assignment title, release/deadline state, completion status, and their own score.
- `Not graded` is preferable to a fake zero.
- Locked tasks have no functional deep link.
- Technical keys such as stable IDs, recall hooks, revision IDs, and database IDs never appear in learner copy.
- A clear route returns to the parent Nexus Platform.

## Required teacher experience

- Sidebar identifies Teacher mode and links to a Teacher Classroom.
- Teacher can create an owned class, enroll an existing student, and assign published grade-matching content.
- Each assignment monitor lists every enrolled learner, status, score, score source, completion count, and class average.
- Teacher can enter or override a 0–100 score per learner.
- Empty classes and empty assignment lists have actionable states.

## Digital Library mechanism

- Every document belongs to exactly one class and inherits access from class ownership or enrollment.
- Teacher supplies a subject, learner-facing title, and useful summary; internal storage keys never appear as learning copy.
- Accept only explicitly supported document types and validate both extension/MIME and file signature.
- Downloads use an authenticated route with `private, no-store` and `nosniff`; never expose a public bucket URL for class-private materials.
- List queries select metadata only and must not load file bytes.
- Use private object storage for production scale. A database-byte MVP must have a strict size cap, be documented as technical debt, and retain a migration-friendly metadata model.
- Deletion repeats teacher/admin ownership checks and removes only the requested class resource.

## Server invariants

1. Teacher mutation checks teacher/admin role and class ownership.
2. Learner mutation checks membership and assignment availability.
3. Auto-score route accepts only an assigned Exam Lab revision.
4. Numeric input must be finite, non-negative, and no greater than its denominator.
5. Percentage is computed server-side.
6. Score response returns only the current learner’s progress.
7. All catalog and runtime routes apply the same assignment access policy.

## Verification checklist

- Policy unit tests cover LOCKED, OPEN, OVERDUE, and deep-link query creation.
- API tests cover unauthenticated, teacher-as-learner, wrong class, locked assignment, invalid score, and valid score.
- Teacher cannot view or grade another teacher’s class.
- Student cannot view another learner’s score.
- Objective exam submission persists and appears in both learner and teacher dashboards.
- Teacher override updates source and timestamp.
- Manual completion displays `Not graded` until a score exists.
- Role changes from login/session alter sidebar and Classroom behavior.
- Typecheck, lint, tests, build, database migration, and browser smoke test pass.

## Future extensions

- Rubric-scored constructed responses with assessor identity and feedback.
- Submission attempts separated from current gradebook projection.
- Teacher extensions, excused work, class archive, learner removal, and teacher reassignment.
- Notification jobs for release, due soon, overdue, and graded states.
- Grade export and audit history for score overrides.
- Cohort analytics that consume gradebook data without broadening learner data visibility.
