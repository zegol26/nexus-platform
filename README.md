# Nexus Platform

Nexus Platform is the parent application for Nexus Talenta Indonesia Academy. It provides authentication, billing, app access, admin operations, public academy/checkout pages, community, and shared navigation for multiple AI-assisted learning apps.

## Apps

- Nexus AI Nihongo: Japanese learning for Indonesian learners with curriculum, AI tutor, voice, reading, listening, flashcards, quizzes, JLPT mock tests, assessment, badges, and Nexus Kingdoms.
- Nexus AI English: interview practice, Dynamic Conversational English, and John AI Coach.
- Nexus AI Arabic: Arabic learning for daily, work, umrah, travel, and dialect contexts.
- PMP Exam Prep: PMP learning, ITTO, glossary, simulator, readiness, and Andromeda AI instructor.

## Start Here

- Agent handbook: `AGENTS.md`
- Documentation index: `docs/index.md`
- Current project state: `docs/project-state.md`
- Current sprint: `tasks/current-sprint.md`
- Known issues: `docs/known-issues.md`
- Release notes: `docs/release-notes.md`

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run lint
npx tsc --noEmit --pretty false
npm test
npm run validate:game
npm run build
```

Additional focused checks:

```bash
npm run validate:community
npm run validate:n5-rehearsal
npm run sanity:english-listening
npm run sanity:english-questions
```

## Deployment

The app deploys to Vercel. Production secrets belong in Vercel Environment Variables, not source files or admin settings. Use `npm run build` for resilient local/Vercel builds and `npm run build:strict` when migration and seed must be mandatory.

Read `docs/deployment.md` before production deploys, aliases, Midtrans changes, or database/seed changes.
