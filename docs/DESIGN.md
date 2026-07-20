---
version: 2
name: Nexus AI Nihongo
description: |
  An AI-led Japanese learning workspace for Indonesian learners.
  Warm but premium, mobile-first, never childish, never corporate.
  The system blends a sumi-paper cream canvas with a single confident
  persimmon CTA, soft pastel-tinted feature cards for the curriculum
  workspace, a quiet near-black surface for the AI Conversation Voice
  and Listening pages, and a textbook-illustration cream palette with
  yellow accents for Admin Analytics. The Aichan mascot, brush-stroke
  accents, and a low-opacity kanji watermark are the recurring Japanese
  signatures across surfaces.

inspirations:
  - source: claude
    used_for: warm AI-tutor surfaces, editorial lesson explanations,
      intelligent feedback voice
  - source: intercom
    used_for: conversational UI, Aichan assistant, chat bubbles,
      reminders, friendly guidance
  - source: notion
    used_for: structured curriculum, reading pages, lesson notes,
      vocabulary lists, soft learning workspace
  - source: elevenlabs
    used_for: AI Conversation Voice + Listening only — audio waveform,
      microphone states, speaking feedback, dark cinematic surface
  - source: posthog
    used_for: Admin Analytics only — data-rich cream dashboard with
      yellow primary CTA and friendly chart aesthetic

colors:
  canvas: "#f7f3ec"
  canvas-soft: "#fbf8f1"
  canvas-strong: "#efeae0"
  surface-card: "#ffffff"
  surface-soft: "#f3eee4"
  surface-cream-strong: "#e8e0d0"
  surface-dark: "#1a1714"
  surface-dark-elevated: "#241f1a"
  surface-dark-soft: "#15120f"
  ink: "#1c1917"
  ink-strong: "#0d0c0b"
  body: "#4a4338"
  body-strong: "#2c2620"
  muted: "#837b6e"
  muted-soft: "#a39c8e"
  hairline: "#d9d2c4"
  hairline-soft: "#e5dfd1"
  hairline-strong: "#bbb09b"
  primary: "#d97843"
  primary-active: "#b85d2c"
  primary-soft: "#fbe7d9"
  on-primary: "#ffffff"
  on-dark: "#f7f3ec"
  on-dark-soft: "#a39c8e"
  matcha: "#6b8e4e"
  matcha-soft: "#dde7c9"
  sakura: "#e8a4b5"
  sakura-soft: "#fadce4"
  sora: "#4a8db0"
  sora-soft: "#d9e8f2"
  yamabuki: "#e0a619"
  yamabuki-soft: "#f8e8b8"
  akane: "#c84033"
  akane-soft: "#f5d6d3"
  card-tint-mint: "#e3efd9"
  card-tint-peach: "#fce6d3"
  card-tint-rose: "#fadce4"
  card-tint-sky: "#d9e8f2"
  card-tint-cream: "#f8f3e6"
  card-tint-lavender: "#e6e0f0"
  gradient-orb-peach: "#f4c5a8"
  gradient-orb-mint: "#a7e5d3"
  gradient-orb-sky: "#a8c8e8"
  gradient-orb-lavender: "#c8b8e0"
  semantic-success: "#6b8e4e"
  semantic-warning: "#e0a619"
  semantic-error: "#c84033"
  semantic-info: "#4a8db0"
  analytics-yellow: "#f7a501"
  analytics-yellow-pressed: "#dd9001"
  analytics-ink: "#23251d"
  analytics-canvas: "#eeefe9"

typography:
  display-serif:
    fontFamily: "'Cormorant Garamond', 'Noto Serif JP', Garamond, serif"
    fontWeight: 500
  body-sans:
    fontFamily: "'Inter', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  mono:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
  jp:
    fontFamily: "'Noto Sans JP', 'Inter', sans-serif"

  display-xl:
    fontSize: 48px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: -0.8px
    use: serif
  display-lg:
    fontSize: 36px
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: -0.5px
    use: serif
  display-md:
    fontSize: 28px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: -0.3px
    use: serif
  title-lg:
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.3
    use: sans
  title-md:
    fontSize: 17px
    fontWeight: 600
    lineHeight: 1.4
    use: sans
  body-md:
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.55
    use: sans
  body-sm:
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
    use: sans
  caption:
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.4px
    use: sans
  caption-uppercase:
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 1.6px
    textTransform: uppercase
    use: sans
  jp-display:
    fontFamily: "'Noto Serif JP', serif"
    fontSize: 28px
    fontWeight: 500
    lineHeight: 1.6
  jp-body:
    fontFamily: "'Noto Sans JP', sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.8
  romaji:
    fontFamily: "'Inter', sans-serif"
    fontSize: 13px
    fontWeight: 500
    fontStyle: italic
    color: muted

rounded:
  xs: 4px
  sm: 6px
  md: 10px
  lg: 14px
  xl: 20px
  pill: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 80px

elevation:
  flat: "none"
  hairline: "0 0 0 1px {colors.hairline}"
  card: "0 1px 2px rgba(28, 25, 23, 0.04), 0 4px 12px rgba(28, 25, 23, 0.04)"
  card-hover: "0 4px 8px rgba(28, 25, 23, 0.06), 0 12px 24px rgba(28, 25, 23, 0.06)"
  primary-glow: "0 8px 24px rgba(217, 120, 67, 0.32)"
  voice-pulse: "0 0 0 0 rgba(217, 120, 67, 0.45)"
---

# Nexus AI Nihongo Design System

**Source of truth for every UI surface in the `/apps/nihongo` route.**
This file is read by AI agents (Codex, Claude Code, Cursor) before any
UI change. The frontmatter above is machine-readable; the body below is
the spec a human reads when writing components.

---

## Brand Essence

Nexus AI Nihongo helps Indonesian learners practise Japanese with an
always-available AI tutor. The brand voice is:

- **Warm but premium** — a sumi-paper cream canvas, persimmon accent,
  soft hairlines. No neon, no glassmorphism, no gradient explosions.
- **Mobile-first** — a learner uses this in commutes, during breaks,
  on the train. Touch targets, readable text, fast first paint.
- **Friendly for Indonesian learners** — UI copy is Bahasa Indonesia
  with formal "Anda" / "saya". Japanese stays in `Noto Sans JP` /
  `Noto Serif JP`. Romaji is muted italic so it never competes with
  kana.
- **Japanese learning journey** — recurring quiet signatures: a faint
  brush-stroke divider, a low-opacity kanji watermark, a single sakura
  petal accent on completion screens. Never literal cherry-blossom or
  fan emoji.
- **Aichan-supported** — Aichan is the assistant mascot, not a
  decorative widget. She lives bottom-right, expands from the corner,
  and speaks in a warm-but-formal voice.
- **Gamification-ready, not childish** — XP bars, badges, and kingdom
  progress exist, but they are small craft elements (10–13px caption,
  matcha or yamabuki tint), not arcade-style banners.
- **Not corporate** — no enterprise shapes, no "Synergy"-style
  illustrations, no stock photo of a smiling team in front of a
  whiteboard.

---

## Visual Atmosphere

The default page floor is `{colors.canvas}` (#f7f3ec), a sumi-paper
cream that reads as warm and considered. Cards layer in pure white
(`{colors.surface-card}`) with hairline `{colors.hairline}` borders
and the `{elevation.card}` shadow.

Two surface modes leave the cream canvas:

1. **Voice & Listening** — a near-black warm surface
   (`{colors.surface-dark}` #1a1714) carrying audio waveforms,
   microphone states, and ElevenLabs-style atmospheric gradient orbs
   (`{colors.gradient-orb-peach}` etc.) drifting at low opacity.
2. **Admin Analytics** — the PostHog-flavoured cream
   (`{colors.analytics-canvas}` #eeefe9) with olive ink, hairline
   bordered cards, and a yellow `{colors.analytics-yellow}` CTA.

Everywhere else the cream + persimmon + soft pastel-tinted card
palette holds.

The Japanese learning journey is communicated through small, recurring
ornamental marks rather than literal motifs:

- A 1px brush-stroke divider (linear gradient from transparent through
  `{colors.hairline-strong}` to transparent) separates major bands.
- A low-opacity kanji watermark (e.g. 学, 道, 縁) at ~6% opacity on
  hero cards.
- A single sakura petal SVG accent on completion / badge moments
  only.
- Aichan portrait frames (40–48px circle) appear inline next to her
  voice copy.

---

## Color Palette

Use the YAML in the frontmatter as the source of truth. Tokens are
referenced inline as `{colors.<name>}` throughout this document.

### Brand & Accent

- **Persimmon** (`{colors.primary}` — #d97843): The signature warm
  orange. Used on every primary CTA, on the active sidebar item, on
  Aichan's pulse ring, and on small badge accents. Inspired by the
  warm AI-tutor coral of Claude — never copied; this is a deeper,
  earthier persimmon (柿色 kakiiro) with more red.
- **Persimmon Active** (`{colors.primary-active}` — #b85d2c): Press /
  hover-darker variant.
- **Persimmon Soft** (`{colors.primary-soft}` — #fbe7d9): Tint for
  pill backgrounds, "active streak" indicators, soft fills on
  primary-themed cards.

### Japanese Accent Family

These accents take their names from traditional Japanese colour
vocabulary, lifted in tone for a modern learning surface:

- **Matcha** (`{colors.matcha}` — #6b8e4e): Used for "completed"
  states, success toasts, JLPT N5 mastery indicators. Soft tint
  `{colors.matcha-soft}` for completed-lesson card backgrounds.
- **Sakura** (`{colors.sakura}` — #e8a4b5): Reserved for celebratory
  moments — badge unlock, level-up, streak milestone. Soft tint
  `{colors.sakura-soft}` for confetti backgrounds.
- **Sora** (`{colors.sora}` — #4a8db0): Used for inline links,
  informational toasts, listening category cards. Soft tint
  `{colors.sora-soft}` for hint callouts.
- **Yamabuki** (`{colors.yamabuki}` — #e0a619): Streak warning, XP
  bonus, paid feature highlights. Soft tint `{colors.yamabuki-soft}`
  for "upgrade required" pills.
- **Akane** (`{colors.akane}` — #c84033): Validation errors only.
  Never used decoratively.

### Surface

- **Canvas** (`{colors.canvas}` — #f7f3ec): Default page floor.
- **Canvas Soft** (`{colors.canvas-soft}` — #fbf8f1): Quiet bands and
  empty states.
- **Canvas Strong** (`{colors.canvas-strong}` — #efeae0): Section
  separators, sidebar background.
- **Surface Card** (`{colors.surface-card}` — #ffffff): Main content
  cards.
- **Surface Soft** (`{colors.surface-soft}` — #f3eee4): Sub-cards,
  callouts.
- **Surface Cream Strong** (`{colors.surface-cream-strong}` —
  #e8e0d0): Selected category tab background.
- **Surface Dark** (`{colors.surface-dark}` — #1a1714): The Voice and
  Listening surface only. Warm-dark — not pure black — so it still
  reads as part of the same brand family.
- **Surface Dark Elevated** (`{colors.surface-dark-elevated}` —
  #241f1a): Elevated cards inside dark Voice / Listening surfaces.

### Card Tints (Notion influence)

Pastel tinted cards group curriculum content visually without using
the persimmon accent:

- `{colors.card-tint-mint}` — Foundations / Hiragana
- `{colors.card-tint-peach}` — N5 Vocabulary
- `{colors.card-tint-rose}` — N4 Vocabulary
- `{colors.card-tint-sky}` — Reading
- `{colors.card-tint-cream}` — Listening
- `{colors.card-tint-lavender}` — Quiz / Mock test

A single curriculum card uses one tint. Don't mix tints inside one
card. The cream canvas absorbs the pastel tone so it never feels
candy-coloured.

### Text

- `{colors.ink}` (#1c1917) — All headlines.
- `{colors.body-strong}` (#2c2620) — Lead paragraphs, emphasised
  inline phrases.
- `{colors.body}` (#4a4338) — Default running-text.
- `{colors.muted}` (#837b6e) — Sub-headings, breadcrumbs, romaji.
- `{colors.muted-soft}` (#a39c8e) — Captions, copyright.
- `{colors.on-primary}` (#ffffff) — Text on persimmon CTAs.
- `{colors.on-dark}` (#f7f3ec) — Cream-tinted white on dark Voice /
  Listening surfaces (echoes the canvas tone).
- `{colors.on-dark-soft}` (#a39c8e) — Secondary text on dark
  surfaces.

### Hairlines & Dividers

- `{colors.hairline}` (#d9d2c4) — 1px borders on cream surfaces.
- `{colors.hairline-soft}` (#e5dfd1) — Inner dividers within the same
  card.
- `{colors.hairline-strong}` (#bbb09b) — Brush-stroke dividers
  between bands (used as a linear gradient from transparent → strong
  → transparent).

### Semantic

- `{colors.semantic-success}` = Matcha
- `{colors.semantic-warning}` = Yamabuki
- `{colors.semantic-error}` = Akane
- `{colors.semantic-info}` = Sora

### Admin Analytics (PostHog scope only)

- `{colors.analytics-canvas}` (#eeefe9) — Canvas for `/admin/analytics`
  pages only.
- `{colors.analytics-yellow}` (#f7a501) — Single yellow CTA pill.
- `{colors.analytics-yellow-pressed}` (#dd9001) — Press state.
- `{colors.analytics-ink}` (#23251d) — Olive-charcoal headings on
  analytics pages.

These tokens are NOT used outside `/admin/analytics`.

---

## Typography

### Stacks

- **Display serif** — `Cormorant Garamond` (Latin) + `Noto Serif JP`
  (Japanese). Weight 500, negative tracking on display sizes.
  Editorial voice; never bold (700+) on display.
- **Body sans** — `Inter` (Latin) + `Noto Sans JP` (Japanese). Weight
  400 paragraphs, weight 500–600 labels.
- **Mono** — `JetBrains Mono` for analytics numbers, debug payloads,
  code blocks.
- **Japanese only** — `Noto Sans JP` body 1.8 line-height,
  `Noto Serif JP` display 1.6 line-height. Always pair Japanese with
  romaji + Indonesian translation in vertical stack.

### Hierarchy

| Token | Use |
|---|---|
| `display-xl` (48px serif 500 / -0.8) | Hero h1 on dashboard |
| `display-lg` (36px serif 500 / -0.5) | Section heads |
| `display-md` (28px serif 500 / -0.3) | Lesson titles, card heros |
| `title-lg` (20px sans 600) | Card titles |
| `title-md` (17px sans 600) | List labels, modal headings |
| `body-md` (15px sans 400 / 1.55) | Default running text |
| `body-sm` (13px sans 400 / 1.5) | Footer copy, captions |
| `caption` (12px sans 500) | Inline metadata |
| `caption-uppercase` (11px sans 600 / 1.6 tracking) | Section eyebrows |
| `jp-display` (28px Noto Serif JP / 1.6) | Japanese sentence display |
| `jp-body` (16px Noto Sans JP / 1.8) | Japanese paragraph |
| `romaji` (13px Inter italic muted) | Romaji line under Japanese |

### Principles

- Display sizes never exceed 48px on mobile; clamp to `display-md`.
- Japanese text gets generous line-height (1.6–1.8) so kana stack
  cleanly above romaji + translation.
- Romaji is always muted, italic, and one step smaller than the
  Japanese it accompanies.
- Don't bold Japanese characters. Use a heavier serif or higher
  contrast colour instead — bold Noto Sans JP looks crude on screen.

---

## Layout Rules

- **Base unit** — 4px.
- **Mobile gutter** — 16px outer, 12–16px inner card padding.
- **Desktop gutter** — 24–32px outer, 24px inner card padding.
- **Max content width** — 1100px centred. Lesson + reading body
  caps at 720px for readability.
- **Section spacing** — 48–64px between major bands on desktop, 32px
  on mobile.
- **Card spacing** — 16px between cards in a stack, 12–16px gutter
  in a grid.
- **Bottom nav height** — 56–64px plus `env(safe-area-inset-bottom)`.
- **Header height** — 44–52px (slim, single row).

### Grid

- **Curriculum overview** — 3-up at desktop, 2-up at tablet, 1-up at
  mobile.
- **Flashcards** — auto-fill grid, min 240px per card, max 6 columns.
- **Reading roadmap** — single column on mobile, 2-column on desktop
  with the avatar progress marker pinned left.
- **Admin analytics** — 12-column grid; KPI tiles span 3 columns
  each, time-series charts span 6.

### Whitespace Philosophy

The cream canvas + serif display + 16–32px internal padding create
an editorial pacing. Whitespace is the ornament. Avoid dense rows of
cards on mobile — collapse to a single column and let each card
breathe.

---

## Components

### Top Navigation Header

- 44–52px tall, sticky, `{colors.canvas}` background, hairline border
  at bottom. Slim single row — no hamburger, no secondary CTA row.
- Carries (left → right): "← Back to Platform" outline pill, brand
  wordmark, right cluster (language toggle, theme toggle, logout).
- The header is intentionally minimal so the screen below it reads as
  full-screen learning surface, not a dashboard chrome. It never
  duplicates a link that already lives in the bottom nav.

### Bottom Navigation

> Replaces the former 224px sidebar (all breakpoints, including
> desktop) so the Nihongo app reads as a focused, single-path "story
> mode" experience instead of an admin-style multi-menu console.

- Fixed to the bottom of the viewport on every breakpoint, `max-width`
  centred container inside a full-width `{colors.surface-card}` bar,
  hairline top border, `backdrop-blur`.
- Adds `env(safe-area-inset-bottom)` padding so it clears the home
  indicator / gesture bar on iOS.
- Four slots: three direct tabs — **Home** (dashboard/story entry),
  **Latihan** (curriculum roadmap — the primary learning path), and
  **Progress** (badges + JLPT readiness) — plus a fourth **Lainnya**
  button that opens a bottom sheet.
- Active tab: `{colors.primary}` filled 36px circle behind the icon,
  `{colors.primary}` label text. Inactive: `{colors.muted}` icon +
  label, no fill.
- **Lainnya sheet** — slides up from the bottom, max 75vh, rounded top
  corners, dim overlay behind. Groups every secondary surface
  (flashcards, quiz, AI tutor, reading, listening, Nexus Kingdoms,
  pre-assessment, rehearsal N5/N4, mock test N5/N4) as a 2–3 column
  icon-label grid instead of a flat 13-item list. Trial-locked items
  keep the amber "Lock" pill and route to `/checkout`.
- Touch targets ≥ 44×44px on every tab, matching the sidebar's old
  accessibility bar.

### Theme Toggle (Nexus AI Nihongo only)

- A 3-position segmented control sitting in the top-right header
  cluster, between the profile menu and the logout button.
- Buttons: `Nexus`, `Squid`, `Rockstar`. Each shows an icon + a
  short two-letter label (e.g. `NX`, `SQ`, `RS`).
- Active button uses `{colors.primary}` fill and `{colors.on-primary}`
  text.
- Inactive buttons use `{colors.canvas-soft}` fill, `{colors.muted}`
  text, hairline border.
- Persists via `localStorage` under the `nihongo-theme` key (handled
  by `next-themes`).
- The toggle is rendered as a client component inside the Nihongo
  layout only — it is not present on `/platform/*` or `/admin/*`.

### Buttons

- **Primary** — `{colors.primary}` fill, `{colors.on-primary}` text,
  `{rounded.md}` (10px), 40px tall, `{elevation.primary-glow}`
  shadow.
- **Secondary** — `{colors.surface-card}` fill, `{colors.ink}` text,
  hairline `{colors.hairline}` border.
- **Tertiary / Ghost** — transparent fill, `{colors.body}` text, no
  border. Used inline.
- **Voice CTA** — pill (`{rounded.pill}`), `{colors.surface-dark}`
  fill on cream surfaces or `{colors.primary}` fill on dark Voice
  surfaces. Microphone glyph on the left.
- **Destructive** — `{colors.akane}` border + ink, never filled.

### Cards

- **Content card** — `{colors.surface-card}` fill, hairline border,
  `{rounded.lg}` (14px), `{elevation.card}` shadow, 24px padding
  desktop / 16px mobile.
- **Tinted curriculum card** — one of `card-tint-*` background, no
  border, soft `{elevation.card}` shadow.
- **Aichan reminder card** — `{colors.primary-soft}` background,
  Aichan portrait left, body copy right, ghost CTA at bottom.
- **Lesson card** — title + romaji subtitle + matcha "completed" pill
  + persimmon "next" indicator.

### Form Inputs

- Pill or rounded-md inputs, `{colors.surface-card}` fill, hairline
  border, `{colors.ink}` text, `{colors.muted-soft}` placeholder.
- Focus: 2px persimmon ring (`rgba(217,120,67,0.4)` + 1px solid
  `{colors.primary}`).
- Error: 1px solid `{colors.akane}` + helper text in `{colors.akane}`.

### Pills & Badges

- Default pill: `{colors.canvas-strong}` fill, `{colors.body}` text,
  `caption` size.
- Brand pill: `{colors.primary-soft}` fill, `{colors.primary-active}`
  text, `caption-uppercase`.
- Level pill (N5/N4/A2): solid colour by level — N5 matcha, N4 sora,
  A2 yamabuki, JLPT mock sakura.
- Streak pill: yamabuki tint, fire glyph + day count.

### Chat / Aichan Bubble

- Aichan messages: cream-tinted bubble (`{colors.canvas-soft}`),
  hairline border, 16px padding, 12px radius.
- User messages: persimmon-tinted bubble (`{colors.primary-soft}`),
  no border, right-aligned.
- Both stack with 8px gap. Avatar appears once per consecutive run.
- Typing indicator: three persimmon dots, 1.4s bounce.

---

## Dashboard Rules

- **Hero band** — full-width `{colors.surface-card}` card, persimmon
  primary CTA, large Nexustalenta logo with `{elevation.primary-glow}`
  halo, current XP + streak summary, link to "Lanjutkan Pelajaran".
- **Progress card** — beside or below hero. Big % number in
  `display-md`, lesson count subtitle, matcha progress fill at 6px
  height.
- **Adaptive profile card** — `card-tint-mint` background,
  recommended daily plan, weakness/strength tag pills.
- **Badge card** — `{colors.surface-card}`, badge image left, name
  + motivational message right.
- **Aichan reminder strip** — runs across the page top under the
  header on mobile when there are pending reminders.
- **Next lesson tile** — large, persimmon CTA, romaji subtitle,
  level pill in the corner.

Avoid more than five distinct cards on the mobile dashboard. Stack
in priority order: pending Aichan reminder → next lesson → progress
→ badge → adaptive profile.

---

## Curriculum Rules

- **Curriculum index** — vertical list of modules grouped by track
  (JLPT, JFT). Each module is a `card-tint-*` card with module name
  in `display-sm`, lesson count, and a horizontal lesson chip row.
- **Lesson chip** — small pill with order number + short title,
  matcha tint when completed, persimmon outline when "next",
  hairline border otherwise.
- **Lesson 41 (Kanji N5) and lesson 42 (Kanji N4)** are flagged with
  a small `caption-uppercase` "Foundation" pill in matcha.
- Track pills (JLPT vs JFT) appear at the top as a 2-tab segmented
  control.

---

## Lesson Page Rules

- **Header** — module breadcrumb, lesson title in `display-md`,
  level pill, completion progress bar.
- **Body** — content card with editorial spacing (24–32px padding).
  Sections: Pengantar (intro), Materi (material), Contoh (examples),
  Latihan (practice), Aichan tip.
- **Japanese examples** — vertical stack: Japanese (`jp-display`),
  romaji (`romaji`), Indonesian (`body-md`). Toggle to hide romaji
  / Indonesian individually.
- **Aichan tip** — call-out card with `{colors.primary-soft}`
  background, Aichan portrait, friendly tip in formal Indonesian.
- **Footer** — "Tandai Selesai" persimmon primary CTA, "Pelajaran
  Berikutnya" secondary CTA.

---

## Quiz Rules

- One question at a time on mobile, two-column on desktop only when
  the question is short.
- Question card centered, `{colors.surface-card}`, 32px padding.
- Question prompt in `display-sm`. If Japanese, render `jp-display`
  with romaji underneath in `romaji`.
- Choice buttons stack vertically on mobile, 2x2 grid on desktop.
  Default state: hairline border, ink text. Selected state:
  persimmon outline + `{colors.primary-soft}` background.
- Reveal state: correct answer flashes matcha (background fade in,
  500ms), wrong answer flashes akane.
- After-answer panel: explanation in editorial body, romaji + IDN
  translation if Japanese, "Lanjut" CTA at bottom.
- Progress bar at the top: 6px tall, matcha fill on persimmon track.

---

## Flashcard Rules

- **Card** — full-screen on mobile, max 480px on desktop. Front:
  Japanese in `jp-display` centered, deck pill at top, "Buka jawaban"
  ghost CTA at bottom. Back: same Japanese smaller + romaji + IDN
  translation + example sentence.
- **Action row** — three buttons: "Sulit" (akane outline), "Cukup"
  (yamabuki outline), "Mudah" (matcha outline). Sized for one-thumb
  reach.
- **Deck switcher** — `caption-uppercase` deck name pill at the top
  with horizontal scroll for other decks.
- **Spaced repetition state** — small streak / interval indicator
  bottom-left in `caption` muted.

---

## Reading Rules

- **Roadmap view** — vertical N5→N4 path. Each article is a node
  with avatar progress marker on the left and an article card
  (`{colors.surface-card}`, hairline border) on the right.
- **Article detail** — single-column reading layout, max 720px,
  `body-md` 1.7 line-height. Japanese paragraph in `jp-body`.
  Romaji toggle and Indonesian translation toggle as small persimmon
  pill buttons in the article header.
- **Vocabulary list** — sticky right rail on desktop, collapsible
  bottom sheet on mobile. Each entry: Japanese / romaji / IDN /
  category pill.
- **Mark complete** — large persimmon CTA at the bottom of the
  article, fills with matcha on success.

---

## AI Tutor Rules

- Two-pane layout on desktop, single column on mobile.
  - Left / top: chat thread.
  - Right / bottom: input composer + suggested prompts.
- **Aichan opening copy** — formal Indonesian: "Halo, saya Nexus AI
  Nihongo Tutor. Tulis pertanyaan Jepang Anda, nanti saya jawab pakai
  penjelasan Indonesia, romaji, dan contoh kalimat."
- **Composer** — multiline textarea, persimmon "Kirim" CTA, 1100ms
  debounce, character counter at 1k chars.
- **Suggested prompts** — 3 ghost pills below the composer with
  starter questions (e.g. "Beda は dan が apa?").
- **Streaming response** — Aichan bubble grows character-by-character,
  typing dots while waiting for first token.
- **Code-switch handling** — Japanese inside her response renders as
  `jp-body` inline; romaji and IDN translation render under each
  Japanese block in muted italic.

---

## AI Conversation Voice Rules

> Drawn from ElevenLabs DESIGN.md ONLY for this surface.

- Whole page sits on `{colors.surface-dark}` (#1a1714).
- Background carries 2–3 atmospheric gradient orbs
  (`{colors.gradient-orb-peach}`, `{colors.gradient-orb-mint}`,
  `{colors.gradient-orb-sky}`) at 30–40% opacity, blurred 80px,
  drifting slowly (12s ease-in-out infinite).
- Centre stage: a circular microphone button, 96–120px, persimmon
  fill, `{elevation.voice-pulse}` ring that animates outward when
  recording.
- Below the mic: live waveform visualiser, 120px tall, `{colors.on-dark}`
  bars on `{colors.surface-dark-soft}` strip.
- Microphone states:
  - **Idle** — persimmon fill, no ring.
  - **Listening** — persimmon ring expanding 1.8s ease-out infinite.
  - **Thinking** — yamabuki ring, slower 2.4s pulse.
  - **Speaking** — matcha ring, waveform bars animate from Aichan's
    response.
  - **Error** — akane ring, error toast `{colors.akane-soft}` /
    `{colors.akane}` bottom-centre.
- Transcript scroll above the mic in `{colors.on-dark}` text on
  `{colors.surface-dark-elevated}` cards. Speaker labels in
  `caption-uppercase`.
- "Selesai" ghost button bottom-right exits to dashboard.

---

## Listening Rules

> Same dark surface treatment as Voice. Smaller mic, larger
> transcript focus.

- Surface `{colors.surface-dark}`, atmospheric orbs 20% opacity.
- Header carries the audio title, level pill, duration in
  `caption-uppercase`.
- **Audio player** — progress bar 4px tall, persimmon fill,
  `{colors.on-dark-soft}` track. Play/pause button 56px persimmon
  pill. Skip ±10s ghost icons either side. Speed control on the
  right (0.75x / 1x / 1.25x).
- **Waveform** below the player at 80px, persimmon bars on dark
  strip. Bars highlight as audio plays.
- **Transcript** — Japanese (`jp-body` `{colors.on-dark}`) + romaji
  (`romaji` `{colors.on-dark-soft}`) + IDN translation
  (`body-md` `{colors.on-dark-soft}`) per line. Active line gets
  `{colors.primary-soft}` underline.
- **Comprehension questions** — open in a bottom-sheet on mobile,
  inline panel on desktop, after audio ends.
- **Mark complete** — persimmon CTA at the bottom; success burst is
  matcha + a single sakura petal SVG.

---

## Gamification Rules

- **XP bar** — 6px tall, matcha fill on `{colors.canvas-strong}`
  track. Sits in the dashboard hero.
- **Level pill** — `caption-uppercase`, persimmon-soft fill,
  persimmon-active text.
- **Streak indicator** — yamabuki tint pill with day count + fire
  glyph. Becomes akane when a streak break is at risk.
- **Badge unlock** — celebratory full-screen modal: badge art
  centered, `display-md` headline ("Lencana baru!"), motivational
  message in `body-md`, persimmon "Lanjut" CTA. A single sakura
  petal floats across (one petal — not confetti).
- **Kingdom progress card** — small castle silhouette, current
  level, XP-to-next, build points / coins as `caption` chips. Stays
  understated on the dashboard — a side card, not the hero.
- **Daily reward** — Aichan reminder bubble at the top of the
  dashboard with the daily login persimmon pill; once claimed, the
  pill flips to matcha "Sudah diklaim".
- **No arcade banners**. No gradient SVG explosions. No "+50 XP!"
  big yellow toasts. Reward feedback is a small matcha pill plus a
  short Aichan line.

---

## Admin Analytics Rules

> Drawn from PostHog DESIGN.md ONLY for this surface
> (`/admin/analytics`).

- Canvas `{colors.analytics-canvas}` (#eeefe9). Olive-charcoal ink
  `{colors.analytics-ink}` for headlines.
- All primary CTAs are the yellow `{colors.analytics-yellow}` pill —
  never persimmon on this surface.
- KPI tiles — `{colors.surface-card}` with hairline `{colors.hairline}`
  border, 4–6px radius, big number in `display-md`, label in
  `caption-uppercase` muted, delta in matcha (positive) or akane
  (negative).
- Time-series cards — same card chrome, chart line in
  `{colors.analytics-yellow}` with a 12% fill underneath.
- Filter bar at top: pill segmented control for time range
  (24h / 7d / 30d / 90d / Custom).
- Data tables — `body-sm`, hairline row dividers, sticky header
  with `caption-uppercase` labels.
- A small hedgehog-style mascot is OUT of scope; we use Aichan
  instead. Aichan does not appear on analytics pages — keep the data
  surface clinical.
- Code samples and debug payloads use `mono`.

---

## Responsive Behavior

| Breakpoint | Width | Key changes |
|---|---|---|
| Mobile | < 640px | Bottom nav (no hamburger, no drawer). Single-column. Hero h1 caps at `display-md`. Curriculum 1-up. Flashcards full-width. Aichan widget collapses to FAB. |
| Tablet | 640–1024px | Curriculum 2-up. Two-column lesson layout when wide enough. Bottom nav unchanged. |
| Desktop | 1024–1440px | Bottom nav stays fixed (no sidebar reappears). Curriculum 3-up. Lesson body caps at 720px. AI Tutor two-pane. |
| Wide | > 1440px | Same as desktop with more outer breathing room. Max content 1100px. |

Touch targets ≥ 44 × 44px. Theme toggle buttons each ≥ 36px on
mobile but cluster within a 132px segmented control.

---

## Do and Don't Rules

### Do

- Anchor every Nihongo page on `{colors.canvas}`. The cream is the
  brand differentiator.
- Use Cormorant Garamond serif for every display headline. Pair with
  Inter / Noto Sans JP body. Negative tracking on display sizes.
- Reserve `{colors.primary}` (persimmon) for the primary CTA on each
  page and the active sidebar item. One persimmon moment per view.
- Use `card-tint-*` pastels to group curriculum / category cards.
  One tint per card.
- Use Japanese accent palette (matcha, sakura, sora, yamabuki) only
  in their semantic role — completed, celebratory, info, warning.
- Pair every Japanese line with romaji + IDN, with both toggleable.
- Keep gamification understated — small pills, matcha tint, single
  sakura petal accents.
- Use the dark Voice/Listening surface only on those two routes.
- Use the Admin Analytics palette only on `/admin/analytics`.

### Don't

- Don't use pure white as the page floor. Cream is the brand.
- Don't bold serif display weight. Cormorant Garamond at 700 reads
  as bombastic.
- Don't put persimmon everywhere — it loses voltage. One per view.
- Don't add cherry-blossom emoji, fan icons, or torii gates as
  decoration. The Japanese signature is the kanji watermark + brush
  divider, not literal motifs.
- Don't render Japanese in Inter. Always use Noto Sans JP /
  Noto Serif JP for kana and kanji.
- Don't bold Japanese characters — use a heavier serif or higher
  contrast colour instead.
- Don't put Aichan on Admin Analytics pages. Analytics is for
  operators, not learners.
- Don't use the analytics yellow CTA outside `/admin/analytics`.
- Don't use the dark Voice surface outside Voice / Listening pages.
- Don't show "+50 XP" arcade toasts. Use a small matcha pill and a
  short Aichan line instead.
- Don't introduce a 5th tinted card colour. The 6 in the palette are
  enough — adding more breaks the gentle pastel rhythm.

---

## Agent Prompt Guide

> When an AI agent (Codex, Claude Code, Cursor) is asked to build or
> change a component in `/apps/nihongo`, it should be primed with the
> following prompt fragment:

```
You are working in the Nexus AI Nihongo route of a Next.js 16 App
Router project. Read docs/DESIGN.md before writing any UI. The active
theme is set per-user via next-themes; respect [data-theme="nexus"]
as the default and do not hardcode colours that conflict with the
nexus tokens. The brand voice is warm, premium, mobile-first, formal
Indonesian copy ("saya"/"Anda"). Reuse component patterns documented
in DESIGN.md before introducing new ones. Pair every Japanese line
with romaji and Indonesian translation. Reserve persimmon for the
primary CTA and active states. Use card-tint-* pastels to group
curriculum content. Keep gamification understated. Never put Aichan
on /admin/analytics. Verify changes by running `npx tsc --noEmit`,
`npm test`, and a manual browser walk through the affected pages.
```

When changing copy, prefer formal Indonesian. When adding Japanese,
add `Noto Sans JP` / `Noto Serif JP` to the font stack and pair with
romaji italic + Indonesian translation.

When the user asks for a new theme, add it as a new `[data-theme="<name>"]`
override block in `app/globals.css` and register it in
`components/apps/nihongo/NihongoThemeToggle.tsx` — never inline-replace
the nexus tokens.

---

## Versioning

This file is `version: 2`. Material additions append a section and
bump the frontmatter version. Material removals require a deprecation
note in the relevant section before the next bump.

### v2 changelog (2026-07-21)

- **Removed**: the 224px sidebar (`NihongoSidebar.tsx`) and its mobile
  drawer (`MobileSidebarDrawer.tsx`) are no longer mounted in
  `app/apps/nihongo/layout.tsx`. `NihongoSidebar.tsx` remains in the
  repo unused pending a follow-up cleanup pass — do not re-wire it.
- **Added**: `NihongoBottomNav.tsx` — fixed bottom nav on every
  breakpoint (Home / Latihan / Progress / Lainnya sheet). See
  Bottom Navigation under Components.
- **Changed**: Top header shrank to a single slim row (44–52px);
  dashboard rebuilt as a single-column "story mode" home (one hero
  continue-CTA, a horizontal path preview, two compact status chips)
  instead of the prior dense multi-card admin-style grid.
- **Fixed**: the `rockstar` theme had no `emerald-*` colour
  translation, so any "completed" card (`bg-emerald-50` +
  `text-slate-900`/`text-slate-400`) rendered near-invisible white
  text on light mint. Added a rockstar emerald mapping mirroring the
  existing squid pattern in `app/globals.css`.
