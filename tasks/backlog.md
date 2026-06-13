# Backlog

## Platform And Auth

- Add admin session monitor with active session count, latest session created, expiry, and forced invalidation audit.
- Improve account support tooling for app access, subscription state, and payment history.
- Add automated smoke checks for checkout, CSRF, login, billing, and payment sandbox on candidate deployments.

## Recording And Voice

- Add explicit microphone capability checks.
- Improve iOS Safari and mobile Chrome permission messaging.
- Normalize MediaRecorder MIME fallback and store selected MIME type.
- Serve recording playback with correct `Content-Type`, `Accept-Ranges`, and compatible formats.
- Add manual QA matrix for iPhone Safari, iPhone Chrome, Android Chrome, desktop Chrome, and desktop Edge.

## Analytics

- User growth by day/week and role.
- Trial, active, expired, and subscription conversion funnels.
- Billing pending/paid/rejected/revenue and payment review time.
- App access and grant audit metrics.
- Nihongo lesson completion, stuck lessons, AI usage, assessment, mock test, reading/listening coverage.
- English submission/review throughput.
- Content operations coverage for flashcards, quizzes, lessons, and DCE.

## AI Assistants

- Per-app Ai-chan reminder copy.
- Admin-configurable thresholds.
- Reminder impression/click/dismiss/minimize tracking.
- English interview feedback reminders.
- Payment proof stale-state reminders.

## Storage

- Move payment proof images to Vercel Blob or equivalent object storage.
- Move listening and interview audio to durable object storage before scale.

## Nexus Kingdoms

- Unique illustrations for continent variants.
- Optional richer battle variance.
- Advanced card modifiers.
- Admin-only hero reset/support tooling if needed.
