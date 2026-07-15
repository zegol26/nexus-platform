# Nexus Platform Documentation Index

Use this as the main entry point for project context.

## Start Here

1. `../AGENTS.md` - required instructions for AI coding agents.
2. `project-state.md` - current product state, completed work, active work, and roadmap.
3. `../tasks/current-sprint.md` - active sprint focus.
4. `known-issues.md` - unresolved issues and operational risks.
5. `context-audit-report.md` - documentation audit and cleanup report.

## Canonical Docs

- `architecture.md` - application architecture, route map, boundaries, and cross-cutting rules.
- `database.md` - Prisma/PostgreSQL models, migrations, seed policy, and data ownership.
- `deployment.md` - Vercel, environment variables, Midtrans, build modes, and production checklist.
- `coding-standards.md` - coding, UI, testing, and documentation standards.
- `roadmap.md` - future work grouped by product and technical area.
- `known-issues.md` - unresolved bugs, limitations, and risks.
- `lessons-learned.md` - historical incidents, root causes, and regression prevention.
- `glossary.md` - product, technical, and domain terms.

## Task Memory

- `../tasks/current-sprint.md` - what is active now.
- `../tasks/backlog.md` - prioritized future work.
- `../tasks/completed.md` - completed work by release/history.
- `../tasks/blockers.md` - active blockers and watch items.

## Historical And Specialized Docs

- `release-notes.md` - chronological release notes summary.
- `release-notes/english-course-improvements.md` - English DCE improvement notes.
- `vercel-fluid-cpu-and-payment-uat.md` - Fluid CPU and Midtrans UAT notes.
- `DESIGN.md` - Nexus AI Nihongo design system.
- `archive/claude-reference-design.md` - archived external Claude design reference; not a Nexus product design source.

## StoryArc Architecture Baseline

- `storyarc/CURRENT_REPOSITORY_FINDINGS.md` - repository audit, actual voice flow, baseline checks, and verdict.
- `storyarc/STORYARC_REUSE_MATRIX.md` - evidence-backed reuse classifications.
- `storyarc/STORYARC_PRODUCT_ARCHITECTURE.md` - application boundaries, domain ownership, and concept placement.
- `storyarc/STORYARC_LEARNING_ARCHITECTURE.md` - progress, evidence, and explainable mastery design.
- `storyarc/STORYARC_GAME_ARCHITECTURE.md` - conditional Phaser boundary and mobile performance gates.
- `storyarc/STORYARC_CONTENT_ARCHITECTURE.md` - versioned editorial lifecycle and runtime content rules.
- `storyarc/STORYARC_LANGUAGE_POLICY.md` - English isolation and explicit STT/AI/TTS context policy.
- `storyarc/STORYARC_ASSET_POLICY.md` - original-IP, provenance, storage, and loading policy.
- `storyarc/STORYARC_IMPLEMENTATION_PLAN.md` - ordered future phases and exit gates.
- `storyarc/STORYARC_OPEN_DECISIONS.md` - unresolved product and operational decisions.
- `storyarc/STORYARC_PHASE_A_CONTENT_CONTRACT.md` - implemented JSON schema, validation, import, and Step 4 handoff contract.
- `storyarc/STORYARC_PHASE_A_IMPLEMENTATION_STATUS.md` - post-audit implementation truth and remaining acceptance gaps.
- `storyarc/STORYARC_CONTENT_MANIFEST.md` - approved initial 90-item allocation and stable content identities.
- `storyarc/STORYARC_EXAM_BLUEPRINT.md` - binding assessment structures, evidence rules, and Exam Lab targets.
- `storyarc/STORYARC_STEP5_CONTENT_VALIDATION_REPORT.md` - historical pre-repair Step 5 failure evidence.
- `storyarc/STORYARC_CONTENT_GENERATION_REPORT.md` - repaired Exam counts, identity/rubric decisions, audio provenance, package hashes, and remaining human-review gates.
- `storyarc/visual-voice-learning-v3.md` - Indonesian-school visual pass, pose-rendering correction, named voice map, and clickable School Core runtime.
- `storyarc/learner-runtime-v4.md` - linear learner story access, populated Quest Journal, and four-mode Exam Lab practice runtime.
- `storyarc/classroom-lms-v5.md` - Campus Arcade shell, Teacher/Guru classes, enrollments, published-content assignments, learner progress, and Exam Lab drip rules.
- `../skills/drip-content-lms/references/dripcontent.md` - reusable Teacher/Student role, assignment drip, completion, scoring, and gradebook contract for future LMS work.

## Admin-Rendered Docs

The admin architecture page reads Markdown directly from `app/admin/architecture/NEXUS_ARCHITECTURE.md` and `app/admin/architecture/RELEASE_NOTES.md`. Those files are retained in place to avoid breaking `/admin/architecture`.
