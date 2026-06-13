# Known Issues

## High Priority

- Mobile recording compatibility is incomplete for iPhone Safari, mobile Chrome, permission-denied states, MIME fallback, and playback headers.
- Production deploy and alias changes are high risk unless candidate URL, Vercel project, domain owner, env, checkout, CSRF, auth, and sandbox payment are verified first.
- Manual proof images are stored as base64 data URLs; large volume will inflate database size.
- Listening audio is stored as database data URLs for MVP; large audio libraries need object storage.

## Product Limitations

- Nexus Kingdom continent variants reuse base banner images.
- Hero selection is intentionally one-time and cannot be reset by users without DB/admin intervention.
- Battle variance remains deterministic.
- Community is polling-based MVP, not realtime.
- Reading completion uses `AnalyticsEvent`, not a dedicated progress table.
- AI-generated personalized reading remains architected but not broadly expanded.

## Documentation Debt

- Release notes exist in both `docs/release-notes.md` and `app/admin/architecture/RELEASE_NOTES.md`.
- Architecture docs exist in canonical `docs/architecture.md` and admin-rendered `app/admin/architecture/NEXUS_ARCHITECTURE.md`.
- `docs/DESIGN.md` is Nihongo-specific, while the archived root design file was an external Claude reference and not a Nexus source of truth.

## Technical Debt

- Admin pages are functional but need richer search/filtering as data grows.
- Trial/access guard discipline must be maintained for every new feature.
- Direct client-triggered learning rewards need server-side validation before adversarial use.
- Seed scripts must stay idempotent to avoid production data loss.
