# Coding Standards

## General

- Read existing code in the target domain before editing.
- Keep changes scoped to the requested behavior and local architecture.
- Prefer domain helpers over page-level duplication.
- Add tests for policy, access, billing, parser, generation, or calculation logic.
- Keep comments sparse and useful.

## Next.js

- Use App Router conventions already present in the repo.
- Server components by default; client components only when needed.
- Use route handlers for API boundaries and validate auth there.
- Check local Next.js behavior before using framework APIs that may have changed.

## TypeScript

- Preserve strong types around route payloads, policy helpers, and domain models.
- Use `zod` or explicit validation for external/user payloads where practical.
- Avoid `any` unless a boundary truly requires it.

## Prisma

- Use migrations for schema changes.
- Regenerate Prisma Client after schema edits.
- Avoid destructive seed operations.
- Keep user-owned data separate from seed-owned catalog data.

## Access And Billing

- Reuse shared guards and policy helpers.
- Never call AI, recording, paid content, or app APIs before checking access.
- Keep payment provider mode and secrets out of client code and admin settings.

## UI

- Follow existing design systems before creating new visual language.
- For Nihongo UI, read `docs/DESIGN.md`.
- Keep Indonesian copy formal in learning surfaces.
- Use the shared i18n dictionary for visible ID/EN toggle copy. Avoid hardcoded page text when the surface has `LanguageToggle`.
- Make mobile layouts first-class for learner workflows.
- Do not add marketing/landing pages when the user asks for an app surface.

## AI Assistant Language Policy

- John in Nexus AI English must reply in English only.
- Do not let John read, translate, transliterate, pronounce, quote, or explain Japanese text.
- Keep the server-side output guard in `lib/english/john-language-policy.ts` wired to John endpoints whenever John reply generation changes.

## Verification

Default regression set:

```bash
npm run lint
npx tsc --noEmit --pretty false
npm test
npm run validate:game
npm run build
```

Use focused scripts when touching relevant domains:

```bash
npm run validate:community
npm run validate:n5-rehearsal
npm run sanity:english-listening
npm run sanity:english-questions
```
