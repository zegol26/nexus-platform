# StoryArc Asset Policy

## Original IP rule

StoryArc uses original Nexus intellectual property. Approved concept characters are Hana, Ryo, and John; the authenticated user is the player. The player name comes from the authenticated profile or an approved player setting and is never hardcoded as Aki.

All shipped StoryArc character portraits are synthetic fictional characters. No real-person identity or face reference is used, and no portrait is intended to depict, identify, or imply endorsement by a real person. The asset manifest records this identity policy alongside generation provenance.

Forbidden assets and references include Naruto, Gojo, Demon Slayer characters, One Piece, copyrighted anime backgrounds/music, traced character art, ripped game assets, and unlicensed web images/audio/fonts.

“Anime-inspired” describes visual language, not an authorization to copy protected characters, costumes, symbols, scenes, music, or distinctive composition.

## Repository baseline

- `public/` has no provenance manifest.
- Current assets total 49.2 MB PNG, 7.4 MB MP3, 1.87 MB WebM, and 30.8 KB SVG.
- Existing hero and castle PNG files reach 2.1–3.47 MB each.
- `next.config.ts` has one external image host and no StoryArc object-storage/CDN configuration.
- Database base64 storage is used by listening, interview recordings, payment proofs, and TTS cache; `docs/known-issues.md` and `docs/database.md` identify object storage as required for scale.

StoryArc cannot rely on file naming or repository presence as proof of commercial rights.

## Required asset manifest

Every published asset has a stable manifest entry:

```text
assetId
revision
type
title/description
sourceType (original-human, commissioned, generated, licensed)
sourceReference
authorOrGenerator
generatorProvider/model/version (when applicable)
prompt/brief reference (when retained)
license
commercialUseAllowed
derivativeUseAllowed
attributionRequired
attributionText
rightsOwner
approvalStatus
approvedBy/approvedAt
storageKey/publicUrl
contentHash
mimeType
byteSize
width/height/duration
sceneIds/tags
locale
reducedMotionVariantId
createdAt/retiredAt
```

Secrets, provider API keys, personal contracts, and sensitive source files do not belong in the public manifest. Contract references can point to controlled records.

## Asset types

- layered scene backgrounds and foregrounds;
- texture atlases/sprite sheets;
- character body/face/expression/animation assets;
- particle textures and UI effects;
- dialogue UI and iconography;
- music, ambience, sound effects, voice, and pronunciation audio;
- captions/transcripts;
- fonts and licenses;
- thumbnails/marketing derivatives;
- reduced-motion/static alternatives.

## Storage architecture

- Local `public/` is acceptable only for a tiny boot shell, test fixtures, and immutable low-volume assets that ship with code.
- Production scene art/audio uses durable object storage plus CDN with content-hashed immutable keys.
- Relational/manifest records store metadata and storage keys, not base64 media bytes.
- Published content references asset ID plus revision/hash, not mutable filenames.
- Private learner recordings use authenticated object storage and retention rules; they are not public game assets.
- TTS cache may reuse the object store under a separate private namespace and policy.

## Pipeline

1. Ingest source plus rights metadata.
2. Malware/type/dimension validation.
3. Human IP/commercial-use approval.
4. Generate optimized derivatives.
5. Pack atlases and create scene manifests.
6. Validate hashes, references, captions, and budget.
7. Publish immutable asset revision.
8. CDN delivery with long-lived immutable caching.
9. Retire by manifest state; do not delete assets referenced by historical published content or learner attempts.

## Mobile budgets

- Each scene declares boot-critical, scene-critical, and deferred assets.
- Only boot-critical plus current scene-critical assets load before interaction.
- First-scene compressed payload target is at most 2 MB until device testing establishes a different approved budget.
- No entire season/grade/arc preload.
- Large backgrounds use responsive resolution tiers and modern formats selected by capability.
- Character animation uses atlases with trimmed transparent bounds.
- Texture dimensions and total texture memory are validated against the approved low-end Android profile.
- Audio is segmented by scene, compressed, and lazy-loaded; captions are separate small text assets.
- Prefetch only the declared next scene after current interaction is stable and network conditions permit it.
- Interrupted downloads are retryable and content-hash verified.

The current 2–3.5 MB single PNG files are reference evidence for enforcing these gates, not acceptable StoryArc defaults.

## Scene manifest

Each scene manifest specifies:

- manifest/content revision;
- asset IDs/revisions/hashes;
- layer order and parallax factor;
- atlas frame/animation references;
- audio/caption references;
- preload class;
- optional resolution/codec variants;
- reduced-motion behavior;
- byte totals and estimated texture memory;
- fallback assets.

Phaser loads from this display-safe manifest. It does not discover arbitrary paths or list storage buckets.

## Naming and identity

- Use original Nexus names and stable machine IDs.
- Hana, Ryo, and John entries include approved character bibles to prevent visual drift.
- User/player display name is escaped and length-limited; dialogue uses a runtime placeholder, not copied content revisions.
- Asset IDs are semantic and IP-neutral; storage keys are content-hashed.

## Publication blockers

An asset blocks content publication when:

- commercial permission is false or unknown;
- author/generator/source is missing;
- required attribution is missing;
- content hash or referenced revision is missing;
- prohibited IP review fails;
- byte/texture/first-scene budget fails;
- caption/transcript/alt requirement fails;
- referenced storage object is unavailable;
- reduced-motion fallback is required and missing.

## Open provenance action

Existing Nexus public art is outside StoryArc scope and was not provenance-audited. No existing image should be copied into StoryArc merely because it is already in `public/`. Any reuse must pass this manifest and rights review.

## Implemented visual-novel asset slice — 2026-07-15

The primary React Story player consumes compressed original WebP backgrounds for the School Gate, Corridor 10-B, Cafeteria, Assembly Hall, Bridge Club Room, SMK Workshop, Library, Principal Office, and internship workplace. It also has individual sprites for Hana, Ryo, John, Ibu Ratna, Maya, Pak Halim, and Sari. `lib/storyarc/game/visual-registry.ts` gives all 27 episodes distinct scene direction through location art, lighting, camera, foreground story props, caption, and ambience metadata. The renderer uses separate body/torso/head layers, dialogue-state motion, blink and speaking states rather than translating one flat sprite as a whole. Generation provenance, runtime paths, SHA-256 hashes, byte sizes, MIME types, and alt text are recorded in `public/storyarc/asset-manifest.json`. The user-provided concept image was used only as a composition and mood reference; it is not shipped by the application. This layered CSS rig is a production improvement, but formal art/IP/accessibility approval and true expression-specific sprite sheets or skeletal source rigs remain open gates.
