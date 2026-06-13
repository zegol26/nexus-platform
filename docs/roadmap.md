# Roadmap

## Immediate

- Keep documentation memory up to date after major changes.
- Complete mobile recording compatibility for English interview and shared recorder behavior.
- Add admin session monitor visibility for single active sessions.
- Continue payment gateway UAT with candidate URL verification before production aliases.

## Platform

- Expand admin analytics from existing database models.
- Improve user/account support tooling around active sessions, access grants, and subscription history.
- Harden public checkout and billing smoke tests.

## Nexus AI Nihongo

- Continue N4/N3 content quality expansion.
- Improve pronunciation scoring UX and historical progress tracking.
- Move listening/audio storage to durable object storage when content grows.
- Harden quiz/flashcard reward calls with server-side answer validation.

## Nexus AI English

- Improve mobile recording and playback reliability.
- Extend DCE content and static audio review.
- Add reviewer/admin throughput analytics for interview submissions.

## Nexus Kingdoms

- Add unique art for continent variants.
- Consider random battle variance or richer card modifiers after MVP balance is stable.
- Add admin/support tooling for hero reset only if operationally needed.

## Ai-chan And AI Assistants

- Add per-app reminders.
- Make reminder thresholds/copy admin-configurable.
- Track impressions, clicks, dismissals, and minimized state.
- Extend context to English review and payment proof flows.

## Infrastructure

- Adopt durable object storage for proof images and audio.
- Add safer deploy smoke automation.
- Keep route metrics focused on slow/error/high-risk routes.
