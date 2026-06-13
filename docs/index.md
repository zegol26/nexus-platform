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

## Admin-Rendered Docs

The admin architecture page reads Markdown directly from `app/admin/architecture/NEXUS_ARCHITECTURE.md` and `app/admin/architecture/RELEASE_NOTES.md`. Those files are retained in place to avoid breaking `/admin/architecture`.
