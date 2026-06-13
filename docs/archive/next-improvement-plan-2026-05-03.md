# Nexus Platform Next Improvement Plan

Last updated: 2026-05-03 23:09 +09:00

## 1. Mobile Recording Compatibility

- Add explicit microphone capability checks before recording.
- Improve iOS Safari and mobile Chrome permission messaging.
- Explain when users must enable microphone access from device/browser Settings.
- Normalize recording MIME type fallback across supported browsers.
- Serve playback audio with correct `Content-Type`, `Accept-Ranges`, and compatible source formats.

## 2. Single Active Session

- Use the existing NextAuth `Session` model.
- Invalidate older sessions for the same `userId` during login.
- Keep one active session per non-admin user.
- Add an admin/session monitor page later with active session count, last session created, and session expiry.
- Decide whether admins need an override for support and testing.

## 3. Analytics From Current Database

- User growth: new users by day/week and role split.
- Trial/funnel: trial users, active users, expired access, and subscription conversion.
- Billing: pending/paid/rejected payments, payment proof review time, and revenue by plan/app.
- App access: active apps per user, expiring access, and access grant audit.
- Nihongo learning: lesson completion, completion rate by lesson/order/level, and stuck lessons.
- AI usage: tutor question counts via `FeatureUsage`, generated lesson content volume, and cached template coverage.
- Assessment: score distribution, weakness/strength tags, estimated level, and pronunciation score trends.
- Mock test: attempts, score percent, readiness pass rate, and wrong-answer hotspots.
- Reading: cached versus AI-generated passages and level/topic coverage.
- English interview: submissions by user/question, review status, score/level distribution, and reviewer throughput.
- Content operations: flashcard count by deck/level/category, quiz/question coverage, and lesson cache missing variants.

## 4. Ai-chan Assistant Evolution

- Add per-app custom reminders.
- Add admin-configurable reminder thresholds and copy.
- Track reminder impressions, clicks, dismissals, and minimized state.
- Extend reminder context to English interview and payment proof review flows.
- Keep all Ai-chan copy in Bahasa Indonesia.
