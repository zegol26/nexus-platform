---
name: drip-content-lms
description: Design, implement, or audit role-aware LMS classrooms, assignments, scheduled drip releases, learner completion, automatic and teacher scoring, and teacher monitoring. Use for StoryArc or future Nexus LMS work involving Teacher/Student behavior, class enrollment, content assignment, release locks, deadlines, gradebooks, or assignment dashboards.
---

# Drip Content LMS

Use this skill to extend Nexus learning apps without duplicating content or trusting client-side access checks.

## Required context

1. Read the repository `AGENTS.md` and its required project-state files.
2. Read `references/dripcontent.md` completely before changing LMS behavior.
3. Inspect the existing content catalog, access guards, Prisma relations, and route/component boundaries.
4. Load the repo's relevant framework and database guidance when present.

## Workflow

1. Define the role matrix for admin, teacher, learner, and unauthenticated users.
2. Reference immutable published content from assignments; never copy the learning payload into the assignment.
3. Enforce enrollment, release time, and ownership in every server page, route, and mutation.
4. Keep `completion` distinct from `score`. Completion may be learner-marked where appropriate; scores require objective grading or an authorized teacher.
5. Give learners only their own assignments and scores. Give teachers only classes they own unless an admin policy explicitly broadens access.
6. Make teacher monitoring answer three questions per assignment: who is assigned, who completed it, and what score is recorded.
7. Hide internal stable IDs, recall hooks, content keys, and database identifiers from learner-facing copy.
8. Test policy helpers, deep-link guards, score validation, and the complete learner-to-teacher flow.
9. Update product-state and known-issue documentation when behavior or release readiness changes.

## Non-negotiable rules

- A hidden button is not authorization; repeat checks server-side.
- A release lock must protect metadata and deep links, not only the list card.
- Never manufacture a score from completion.
- Store score numerator, denominator, percentage, source, and timestamp when automatic grading exists.
- Allow teacher override only after class ownership and membership checks.
- Deadlines and late-submission policy are separate from release locks.
- Seeds must be idempotent and must not delete learner-owned classroom or gradebook data.

Use the reference file for the canonical state model, data contract, UI requirements, and regression checklist.
