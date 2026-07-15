# StoryArc Implementation Plan

This is an ordered future plan. Step 1 audit does not authorize implementation, dependency installation, schema changes, content generation, deployment, or push.

## Phase 0 — Resolve blocking product decisions

1. Approve curriculum authority/standards and Grade 10–12 phase mapping.
2. Approve mastery algorithm, evidence weights, proficiency bands, and certificate rule.
3. Approve editorial workflow roles and approval separation.
4. Approve asset creation/licensing process, object storage/CDN, and retention.
5. Approve StoryArc John UI language/scaffolding policy and learner-data retention.
6. Select the low-end Android test device/profile and measurable performance budgets.

Exit: every blocking item in `STORYARC_OPEN_DECISIONS.md` has an owner and decision.

## Phase 1 — Repair shared app/language isolation

1. Introduce app-scoped feature usage/access helpers instead of Nihongo-hardcoded guards.
2. Define a server-owned tutor/voice context registry.
3. Give Nihongo and existing English explicit contexts.
4. Reject unknown STT/TTS contexts; remove Japanese/Ai-chan fallbacks from shared routing.
5. Attribute John English usage to English and preserve current entitlement behavior through tests/migration policy.
6. Add cross-app history, locale, STT, TTS profile, and cache-isolation tests.

Exit: English John works for English-entitled users without Nihongo access; Nihongo voice remains Japanese through explicit context; no unknown context falls back.

## Phase 2 — Register StoryArc in the platform

1. Add `storyarc` to the code registry and database seed catalog.
2. Add app plans/checkout/admin access using existing platform primitives.
3. Add protected `/apps/storyarc` layout and empty server-rendered shell.
4. Add platform dashboard/apps navigation without modifying existing app routes.
5. Add access/payment smoke and policy tests.

Exit: authentication, entitlement, expiry, admin bypass, purchase activation, and navigation work for an empty StoryArc app.

## Phase 3 — Establish shared learning evidence primitives

1. Finalize relational design for stable content item identity, attempts, completion, evidence, mastery projection, and projection changes.
2. Create migration and backfill strategy in a later authorized task.
3. Implement append-only evidence and versioned mastery projector.
4. Add idempotency, revision lineage, and “why changed” queries.
5. Adapter-test current apps without moving their data until explicitly planned.

Exit: a synthetic StoryArc assessment can produce an explainable mastery delta; XP events cannot.

## Phase 4 — Build content lifecycle and asset manifest

1. Define versioned StoryArc JSON schemas.
2. Implement dry-run import, deterministic validators, and release-count checks.
3. Implement Draft → Validate → Review → Approve → Publish → Supersede/Archive.
4. Implement immutable published revision reads.
5. Implement asset manifest/provenance and object-storage integration.
6. Add admin catalog, review queue, release report, and rollback tooling.

Exit: a small hand-authored fixture package can be imported, reviewed, published, fetched, superseded, and historically resolved without learner-runtime generation.

## Phase 5 — Phaser proof of concept gate

1. Install no engine until this separately authorized phase.
2. Build one original test scene with tiny licensed/test assets, one character, parallax, expression change, dialogue choice, hotspot, and save/resume.
3. Use a lazy client-only host and typed React bridge.
4. Persist authoritative state through server route handlers with idempotency/version checks.
5. Measure bundle separation, first-scene payload, memory, interaction, resize, touch, reduced motion, cleanup, interrupted network, and context loss.
6. Decide APPROVED or NOT APPROVED from measured gates in `STORYARC_GAME_ARCHITECTURE.md`.

Exit: recorded architecture decision. Failed gates prevent production Phaser adoption.

## Phase 6 — StoryArc vertical slice

1. Build one Grade 10 slice across School Core, Story Mode, and Exam Lab.
2. Use one learning objective/competency through exposure, practice, assessed evidence, and delayed recall.
3. Add Story XP/quest/relationship state separate from mastery.
4. Add StoryArc John through the isolated context.
5. Verify admin publication and learner runtime against immutable revisions.
6. Run accessibility, mobile, security, entitlement, and causal mastery tests.

Exit: one end-to-end slice proves the full architecture before bulk content.

## Phase 7 — Content tooling rehearsal

1. Rehearse generation/import with a tiny non-production sample.
2. Review validator warnings, reviewer throughput, asset pipeline, and release rollback.
3. Verify exact grade/track allocation reports.
4. Verify no hardcoded React page is required per item.

Exit: approved tooling and operating procedure. This phase still does not generate the initial 90 unless separately authorized.

## Phase 8 — Initial 90-item production

1. Generate/author in controlled batches.
2. Validate, review, approve, and publish through the lifecycle.
3. Meet 45 School Core / 27 Story Mode / 18 Exam Lab and 30 items per grade.
4. Run IP, asset, learning-quality, language, performance, and accessibility gates.

Exit: immutable release candidate with complete review evidence.

## Phase 9 — UAT and operational readiness

1. Test low-end Android, supported iOS Safari, desktop, touch, network interruption, save/resume, reduced motion, and audio permissions.
2. Test auth/session/access/payment activation and expiration.
3. Test tutor isolation, STT/TTS/cache, content rollback, and mastery explanation.
4. Establish dashboards/alerts for route errors, provider cost, content failures, and player-state conflicts.
5. Complete privacy, retention, support, and incident runbooks.

Exit: signed UAT and operational checklist.

## Phase 10 — Controlled release and expansion

1. Deploy through the repository’s normal git/Vercel workflow only after candidate smoke checks.
2. Start with staged access/feature flags and observe mobile/provider/state metrics.
3. Add the remaining 90 target items through new reviewed releases, not code pages.
4. Recompute release allocation and performance budgets for every expansion.

Exit: 180-item target can be reached without architecture duplication or season-wide preload.

## Required verification by phase

- TypeScript, lint, unit/policy tests, content validators, and Next production build in an isolated non-production database/environment.
- Schema phases include migration review, production-data backfill plan, Prisma generation, and rollback plan.
- Game phases include browser tests and measured bundle/device reports.
- Payment/deployment phases follow `docs/deployment.md` and the historical safety checks in `docs/lessons-learned.md`.
- No bulk content phase begins before the vertical slice and tooling rehearsal pass.
