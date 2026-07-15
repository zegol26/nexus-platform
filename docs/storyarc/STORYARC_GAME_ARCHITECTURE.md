# StoryArc Game Architecture

## Phaser decision

**CONDITIONAL.** Phaser is approved for a time-boxed client-only proof of concept, not yet approved as a production dependency.

Repository evidence:

- Nexus is a Next.js 16 App Router/React 19 monolith (`package.json`, `app/`).
- No game engine or route-level dynamic import exists today.
- Current game UI is React plus server APIs under `components/game`, `lib/game`, and `app/api/game`.
- `public/` already contains 49.2 MB of PNGs and 7.4 MB of MP3s; several single images exceed 2 MB.
- Current mobile recording and storage constraints are recorded in `docs/known-issues.md`.

External compatibility evidence:

- Phaser Studio publishes an official Next.js template and describes a React/Phaser bridge plus event bus: <https://github.com/phaserjs/template-nextjs>.
- The official bridge creates the game in a layout effect and calls `game.destroy(true)` on cleanup: <https://github.com/phaserjs/template-nextjs/blob/main/src/PhaserGame.tsx>.
- Phaser documents a compressed full runtime around 345 KB and supports WebGL/Canvas, scenes, loaders, animation, cameras, particles, and touch input: <https://github.com/phaserjs/phaser>.

These sources establish feasibility. They do not establish acceptable StoryArc performance in this repository.

## Hard boundary

| Layer | Responsibilities | Forbidden |
| --- | --- | --- |
| Phaser visual runtime | Scene rendering, layered backgrounds, parallax, particles, character animation, camera effects, hotspots, transient dialogue presentation, touch hit areas, scene transitions | Prisma, auth/session parsing, payment/access decisions, provider calls, canonical content mutation, mastery calculation |
| React / Next.js | Protected route shell, dashboard, School Core/Exam Lab UI, loading/error/accessibility overlays, reduced-motion controls, audio permission UI, typed bridge host | Duplicating authoritative state inside UI, importing Phaser into Server Components |
| Server domain | Published content/revision resolution, authoritative player state, save/resume, idempotent choice/quest mutations, learning attempts/evidence, asset manifest authorization | Rendering frames, trusting client-supplied rewards or state totals |

Phaser must never import `lib/db/prisma.ts` or `@prisma/client`.

## Client boundary

The proposed Story Mode route renders a Server Component shell and a small client host. The client host loads the game runtime only after entitlement and bootstrap data resolve.

Required properties:

- dynamic client-only import of the Phaser host;
- no Phaser import in route layout, page Server Component, shared app layout, dashboard, School Core, or Exam Lab bundles;
- create exactly one game instance per mounted host;
- destroy game, canvas, audio, timers, event listeners, object URLs, and bridge subscriptions on unmount;
- use a typed event bridge; do not place the Phaser `Game` or `Scene` instance in global React state;
- remount or explicitly reset on user/item/revision changes;
- render a server/React fallback while the engine and first-scene assets load.

Hydration risk is controlled because the server renders only the host container and fallback; canvas creation occurs after mount. A proof test must verify development Strict Mode does not create two surviving game instances.

## Bootstrap and state flow

1. React requests a Story Mode bootstrap for episode/item revision.
2. Server verifies session, StoryArc entitlement, published revision, and player ownership.
3. Server returns display-safe scene manifest, current checkpoint, allowed next actions, signed/versioned asset references, and a state version.
4. Phaser loads only the first scene and shared minimum atlas/audio.
5. Phaser emits typed intents such as `hotspot.selected`, `dialogue.choice`, or `checkpoint.requested`.
6. React bridge posts the command with state version and idempotency key.
7. Server validates the command against canonical rules and writes the transition.
8. Server returns a new state version and display events; Phaser animates the result.
9. Network failure leaves the last acknowledged checkpoint intact and presents retry/resume UI.

Do not optimistically grant XP, relationship points, quest completion, vocabulary unlocks, or learning evidence. Visual feedback may be optimistic only when labeled pending and reversible.

## Persistent game state

Authoritative state includes:

- current arc/episode/scene/checkpoint;
- completed story nodes;
- quest status;
- relationship values;
- Story XP and player level;
- narrative achievements;
- unlocked hotspots and choices;
- vocabulary/expression encounter/unlock references;
- state version and last acknowledged idempotency key.

Use one compact player snapshot for fast resume plus append-only transition/audit records for causality and recovery. Store content IDs/revisions rather than copied dialogue. Local storage may cache the latest acknowledged bootstrap but is never authoritative.

## Scene content

Each published scene manifest contains stable IDs and references to:

- location and layered backgrounds;
- texture atlases and animation definitions;
- characters, positions, idle/blink/breath/expression states;
- dialogue nodes and choices;
- hotspots and quest hooks;
- audio cues and captions;
- camera/particle/reduced-motion variants;
- next-scene preload hints;
- checksums/version.

School Gate, Classroom, Cafeteria, Library, and Club Room are content-defined locations, not separate React pages.

## Low-end Android budgets and loading gates

The proof of concept must define measured budgets before production approval. Initial acceptance targets:

- Phaser chunk excluded from non-Story routes;
- engine plus Story host JavaScript measured separately;
- first interactive scene downloads only shared shell plus that scene;
- first-scene compressed assets target at most 2 MB on the initial mobile profile;
- no individual raster texture above the tested device maximum; use atlases sized for low-end GPU texture limits;
- later scenes load on demand with bounded prefetch;
- no full-season preload;
- compressed WebP/AVIF for static art where Phaser/browser support is verified; atlas PNG/WebP selected by visual/performance test;
- compressed AAC/MP3/Opus variants selected by browser capability, with captions always available;
- suspend animation/audio when page visibility is hidden;
- reduced motion disables parallax, camera shake, nonessential particles, and continuous idle effects;
- viewport uses safe-area insets, orientation-aware scaling, large touch targets, and deterministic coordinate mapping.

Existing 2–3.5 MB PNG assets demonstrate that an asset pipeline and manifest budgets are blocking production requirements.

## Testability

- Pure reducers validate dialogue/quest/player transitions without Phaser.
- Contract tests validate manifest schemas and bridge events.
- Route tests validate entitlement, revision, idempotency, stale state version, and reward rejection.
- Phaser smoke scene uses tiny generated/test assets and checks create/destroy/remount.
- Browser tests cover touch, reduced motion, resize/orientation, offline interruption, resume, audio block, and WebGL context loss/Canvas fallback.
- Bundle analysis proves non-Story routes do not include Phaser.
- Performance tests use an agreed low-end Android profile and throttled network.

## Production approval gate

Phaser becomes **APPROVED** only after the proof demonstrates:

1. Next.js 16 production build succeeds without server import/hydration faults.
2. One-instance lifecycle and cleanup pass repeated navigation tests.
3. Non-Story routes have zero Phaser payload.
4. First-scene budget and interaction targets pass the agreed Android device/profile.
5. Save/resume and interrupted-network tests pass.
6. React/Phaser/server boundaries are enforced by imports and tests.
7. Asset provenance and scene-manifest validation pass.
8. Accessibility/reduced-motion fallback remains usable without animation.

If any boundary or mobile gate fails, use a smaller custom Canvas/WebGL renderer or a React/CSS animation implementation for the validated subset; do not weaken authoritative-state or asset-budget rules.
