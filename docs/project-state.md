# Project State

Last consolidated: 2026-06-13 JST

## Current Product State

Nexus Platform is a multi-app learning platform for Nexus Talenta Indonesia Academy. It has public academy/checkout/legal pages, authenticated platform dashboard, billing, community, Nexus Kingdoms game, admin console, and app workspaces for Nihongo, English, Arabic, and PMP.

The codebase is a Next.js 16 App Router app using TypeScript, Prisma 7, PostgreSQL, NextAuth credentials auth, OpenAI, optional ElevenLabs, Midtrans, Nodemailer, and Vercel.

## Completed Features

- Public academy surface with landing, login, register, checkout, terms, refund policy, contact, and overview-trial pages.
- Platform shell with dashboard, programs, apps, billing, settings, community, and game entry.
- Admin console for users, subscriptions, payments, settings, usage, analytics, lessons, lesson cache, readings, listening, flashcards, quizzes, recordings, PMP content, and architecture docs.
- Authentication with credentials, Prisma adapter, JWT session, single active session records, and 4-hour idle timeout.
- App access enforcement for Nihongo, English, Arabic, PMP, and internal lesson engine restrictions.
- Midtrans sandbox/production payment architecture, production mode controlled by environment, public `/payment/finish`, and canonical Monthly/Quarterly/Yearly plan catalog repair.
- Nexus AI Nihongo curriculum, AI lesson cache, AI tutor, voice conversation, reading roadmap, listening module, flashcards, quiz, JLPT N5/N4 mock tests, N5/N4 full rehearsal, pre-assessment, pronunciation scoring, badges, and theme toggle.
- Nexus Kingdoms game with castle/hero art, hero selection, cross-continent targets, retaliation visibility, battle reports, attack notifications, resource/troop mechanics, and learning rewards.
- Nexus AI English dashboard, interview practice, DCE curriculum, John AI Coach, roleplay, dual-voice listening, and validation scripts.
- Nexus AI Arabic curriculum, tutor, conversation, quiz, and progress routes.
- PMP Exam Prep dashboard, diagnostic, simulator/exam, ITTO, glossary, knowledge base, readiness, brain dump, Andromeda chat, progress, and admin content tools.
- Route metrics for Fluid CPU risk visibility and `/admin/usage`.

## Latest Release History Read

- Latest root release note: Anonymous Nihongo Trial and Documentation Consolidation, UAT OK.
- Latest admin release note: `RN-2026.06.13-001`, anonymous Nihongo trial, documentation consolidation, John English-only guard, login localization, and platform header cleanup.
- Latest specialized note: English course improvements expanded DCE sections and quality validation.
- Latest UAT/RCA note: Vercel Fluid CPU and Midtrans payment hardening, including the 2026-05-27 payment gateway regression.

## Active Work

- Documentation consolidation and durable AI-agent project memory.
- Follow-up roadmap remains focused on mobile recording compatibility, single active session monitoring/hardening, analytics from current database, and Ai-chan assistant evolution.
- Payment gateway UAT and production deployment safety remain operationally sensitive.

## Latest Maintenance Notes

- Anonymous Nexus AI Nihongo trial is UAT OK for pre-assessment, flashcards, and quiz without login. Paid/progress-bearing Nihongo surfaces remain locked, anonymous analytics are acknowledged without persistence, and anonymous APIs use best-effort rate limits.
- Project memory has been consolidated into `AGENTS.md`, canonical `docs/`, `tasks/`, and `skills/` files while preserving the admin-rendered architecture docs.
- John in Nexus AI English now has a server-side English-only output guard. If a model reply contains Japanese/CJK, Korean, Arabic, or Cyrillic script, the API repairs or replaces it with an English coaching redirect before returning it.
- Login page copy now uses the universal ID/EN dictionary for field labels, action text, and feature chips.
- Platform header no longer displays the redundant "Platform Console" title/subtitle block.

## Known Issues And Debt

- Mobile recording needs stronger browser capability checks, MIME fallback, permission messaging, and playback headers.
- Manual proof images are stored as base64 data URLs; this is stable for MVP but expensive at scale.
- Listening audio is also stored as database data URLs for MVP stability; object storage is needed for larger media libraries.
- Existing release notes are duplicated across root docs and admin-rendered docs.
- `app/admin/architecture` remains a second documentation surface because the admin page reads it directly.
- Historical production incidents show deploys and seeds can damage data if git, Vercel aliases, env, and seed behavior drift.

## Future Roadmap Items

- Mobile recording compatibility pass for English interview and shared recording utilities.
- Admin session monitor for single active session visibility.
- Database-backed analytics for growth, billing, app access, learning progress, AI usage, assessment, mock tests, reading/listening, English review throughput, and content operations.
- Ai-chan reminder evolution with per-app reminders, configurable thresholds/copy, and impression/click/dismiss tracking.
- Durable object storage for proof images and audio.
- Better production deployment runbooks and automated smoke checks.
