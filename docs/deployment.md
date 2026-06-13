# Deployment

## Platform

The app deploys to Vercel as a Next.js application. Production uses Vercel Environment Variables for database, auth, Midtrans, SMTP, OpenAI, and optional ElevenLabs credentials.

## Build Commands

- `npm run build`: resilient build. Runs Prisma migrate when `DATABASE_URL` is reachable, always runs Prisma generate, skips seed in Vercel production unless `RUN_SEED_ON_BUILD=true`.
- `npm run build:strict`: requires database migration and seed to pass before Next build.
- `npm run start`: starts the built app.

## Required Production Checks

Before aliasing or promoting a production deployment:

1. Confirm the Vercel project and candidate deployment with `vercel inspect`.
2. Confirm current domain ownership with `vercel alias ls`.
3. Verify `/checkout` returns 200 on the candidate URL.
4. Verify `/api/auth/csrf` returns 200 on the candidate URL.
5. Verify login and platform dashboard.
6. Verify `/platform/billing`.
7. Create a sandbox Midtrans transaction when sandbox UAT is enabled.
8. Confirm local `.env` files are excluded by `.vercelignore`.

## Midtrans Policy

- Production mode is controlled by deployment runtime and production server key presence.
- Admin UI can only open/close sandbox checkout for UAT.
- Production server keys, merchant credentials, and client keys belong in Vercel Environment Variables.
- Do not store live secrets in `PlatformSetting`, docs, screenshots, or source.
- Finish Redirect URL is `/payment/finish`.
- Webhooks verify using the transaction's stored `midtransMode` when present.

## Environment Variables

See `.env.example` for the full list. Critical groups:

- Core: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.
- AI: `OPENAI_API_KEY`, optional OpenAI model overrides.
- Voice: optional `ELEVENLABS_API_KEY`, voice IDs, model ID.
- Payments: Midtrans sandbox and production keys.
- Email: SMTP host, port, auth, from/reply-to addresses.

## Lessons From Production

Do not use direct `vercel --prod` uploads as a normal workflow. A previous direct deploy and alias mismatch caused production checkout/auth regression and source-of-truth drift. Prefer git-based deploys and verify candidate URLs before alias changes.
