# Context Audit Report

Last audited: 2026-05-29 JST

## Documentation Health Score

Current score after consolidation: 82/100.

Before consolidation, the project had valuable historical knowledge but weak discoverability. Release notes and architecture knowledge existed, but key sources were split between root docs, `docs/`, and `app/admin/architecture`. The root README was still mostly the create-next-app scaffold. `AGENTS.md` only warned about Next.js and did not explain Nexus.

## Existing Documents Found

- `AGENTS.md`
- `README.md`
- `CLAUDE.md`
- `NEXT_STEPS.md`
- `docs/release-notes.md`
- `docs/release-notes/english-course-improvements.md`
- `docs/vercel-fluid-cpu-and-payment-uat.md`
- `docs/DESIGN.md`
- `app/admin/architecture/RELEASE_NOTES.md`
- `app/admin/architecture/NEXUS_ARCHITECTURE.md`
- Archived during this pass: `docs/archive/claude-reference-design.md` from old root `DESIGN.md`.

## Duplicate Information

- Release history existed in both `docs/release-notes.md` and `app/admin/architecture/RELEASE_NOTES.md`.
- Architecture existed in `app/admin/architecture/NEXUS_ARCHITECTURE.md` and is now summarized in canonical `docs/architecture.md`.
- Roadmap/backlog items existed in `NEXT_STEPS.md` and at the bottom of release notes.
- Design guidance existed in two files named `DESIGN.md`, but one was an external Claude reference while `docs/DESIGN.md` is the Nexus AI Nihongo design system.

## Outdated Or Misleading Information

- `README.md` still described a generic Next.js starter and underrepresented Platform, English, Arabic, PMP, billing, admin, and deployment context.
- Root `DESIGN.md` was an Anthropic/Claude reference, not the Nexus design source of truth.
- `AGENTS.md` contained only a Next.js warning and no project memory instructions.
- `CLAUDE.md` only pointed to `AGENTS.md` and carried no standalone project context.

## Missing Information Before This Pass

- No canonical documentation index.
- No durable current project state summary.
- No canonical database document.
- No canonical deployment runbook.
- No dedicated coding standards doc.
- No dedicated lessons learned document.
- No task memory folder for current sprint, backlog, completed work, and blockers.
- No audit report summarizing documentation health and debt.

## Contradictions Or Tensions

- Root `DESIGN.md` could be mistaken as product design guidance, but it described Claude/Anthropic styling. It now lives in archive.
- Release notes mention historical production seed-on-build behavior, while current `scripts/build.mjs` skips production seed by default unless `RUN_SEED_ON_BUILD=true`. The current deployment doc reflects the script behavior.
- `docs/DESIGN.md` says the theme toggle is handled by `next-themes`, while release notes say `next-themes` was replaced by a minimal in-house provider. Future UI work should verify implementation before following that line literally.
- Target structure requested `docs/architecture.md`, but `/admin/architecture` reads `app/admin/architecture/NEXUS_ARCHITECTURE.md`; both must remain in sync until refactored.

## Files Created

- `docs/index.md`
- `docs/project-state.md`
- `docs/architecture.md`
- `docs/database.md`
- `docs/deployment.md`
- `docs/coding-standards.md`
- `docs/roadmap.md`
- `docs/known-issues.md`
- `docs/lessons-learned.md`
- `docs/glossary.md`
- `docs/context-audit-report.md`
- `docs/archive/README.md`
- `tasks/current-sprint.md`
- `tasks/backlog.md`
- `tasks/completed.md`
- `tasks/blockers.md`

## Files Updated

- `AGENTS.md`
- `README.md`

## Files Archived

- `DESIGN.md` moved to `docs/archive/claude-reference-design.md`.
- `NEXT_STEPS.md` moved to `docs/archive/next-improvement-plan-2026-05-03.md`.

## Documentation Debt Remaining

- Decide whether `docs/release-notes.md` or `app/admin/architecture/RELEASE_NOTES.md` is the single release-note source.
- Refactor `/admin/architecture` to read canonical docs, or label its local Markdown as admin snapshots.
- Update `docs/DESIGN.md` to remove stale `next-themes` language if implementation confirms the in-house provider is current.
- Convert `CLAUDE.md` into a useful pointer or remove it if no tool depends on it.
- Add a short API reference if external consumers or frontend agents need endpoint-level contracts.

## Recommended Improvements

- Keep `AGENTS.md`, `docs/project-state.md`, `tasks/current-sprint.md`, and `docs/known-issues.md` updated in every meaningful development session.
- Add a release-note template that writes once and renders in both docs/admin if needed.
- Add automated doc checks for required files.
- Add deployment smoke scripts for high-risk production routes.
