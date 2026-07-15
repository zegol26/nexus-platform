# StoryArc Dialogue Design Rules

Binding rules for all Story Mode dialogue and choices, and for School Core / Exam Lab dialogue material. Dialogue is data-driven canonical content compatible with the approved StoryArc schema; Codex owns implementation.

## 1. Naturalness standard

- Dialogue models how English is actually used: contractions, discourse markers ("well", "actually", "you know what"), backchannels, and realistic turn length.
- Teen scenes sound contemporary but avoid short-lived internet slang; nothing that will feel dated in three years or that a Grade 10 learner cannot transfer.
- No corporate English in school social scenes ("per our discussion", "circle back", "touch base" are banned outside Grade 12 workplace scenes, where mild professional register is the teaching point).
- Register is scene-typed: club room = informal; classroom = neutral; principal's office / sponsor / workplace = formal. Register shifts are explicit teaching moments, not accidents.
- Character English is a controlled variable (see Character Bible): no character models errors as correct speech.

## 2. Choice design

Banned pattern: choices that are only [correct grammar] / [wrong grammar] / [ridiculous answer].

Every choice set uses **communication dimensions**. Each option is tagged with one primary dimension:

| Dimension tag | Meaning | Example (declining an invitation) |
| --- | --- | --- |
| `natural` | What a competent speaker would actually say | "I'd love to, but I've got practice today. Rain check?" |
| `understandable-unnatural` | Meaning clear, phrasing off | "I want, but I cannot join in this day." |
| `too-direct` | Grammatical, socially blunt | "No. I'm busy." |
| `overly-formal` | Register mismatch | "I regret to inform you that I must decline your invitation." |
| `vague` | Evasive, forces follow-up | "Hmm, maybe, we'll see, kind of busy…" |
| `socially-weak` | Misses the expected social move (no thanks/softener) | "Can't come." *(walks away)* |
| `context-inappropriate` | Wrong situation reading | "Sure! Let's talk about the budget." |
| `wrong-tense` | Targeted grammar slip | "I already go there yesterday." |
| `wrong-collocation` | Targeted lexical slip | "I'll make my homework first." |

Rules:

1. 3–4 options per choice; **at least two must be acceptable ways forward** (e.g., `natural` and `too-direct` both continue the scene, with different social consequences).
2. Distractors are plausible learner productions, never absurd.
3. Option order is not a quality ranking; the `natural` option is not always first or longest.
4. Dimension mix per episode is planned (see per-item choice plans at generation time); `wrong-tense` / `wrong-collocation` options appear only when that form is the episode's language focus.
5. Choices marked NARRATIVE CHOICE (pure story preference — which stall to visit, whom to sit with) carry no language dimensions and no learning feedback.

## 3. Feedback model

Feedback distinguishes four labeled lenses, using only the ones relevant to the chosen option:

- **GRAMMAR** — form accuracy ("'go' needs past form here: *went*").
- **NATURALNESS** — what speakers actually say ("Correct, but 'I refuse' sounds harsh; try 'I'll pass this time.'").
- **CONTEXT** — situation/register fit ("That's fine with friends, but this is the principal.").
- **SOCIAL COMMUNICATION** — the interpersonal move ("You declined without thanking her — Hana looks a little hurt.").

Rules: feedback is short (≤2 sentences per lens, max 2 lenses per choice); always shows one model utterance; consequences show, not just tell (relationship/NPC reaction reflects social feedback); acceptable-but-imperfect options get "worked, and here's the upgrade" feedback, never "wrong".

## 4. Interaction classification

Every interactive beat is labeled in content data as exactly one of:

| Label | Effect | Example |
| --- | --- | --- |
| NARRATIVE CHOICE | Story/relationship state only; no evidence | Choosing which club member to help first |
| LEARNING PRACTICE | Practice evidence (formative); feedback given; retry allowed | Rephrasing Ryo's blunt message politely |
| ASSESSED INTERACTION | Assessed evidence against a declared rubric; controlled conditions; no mid-task coaching | S3E8 interview answers |
| RECALL EVIDENCE | Delayed retrieval of previously introduced language, scored against the original item | Producing the Grade 10 clarification chunk in S3E5 |

Not every choice is mastery evidence; most are narrative or practice. Assessed interactions are visually and contextually distinct (in-fiction framing: rehearsal vs. the real thing).

## 5. Dialogue structure per scene

- Scenes open with context (place, goal, who's present) before the first choice.
- Max ~6 dialogue nodes between meaningful player inputs; no long NPC monologue walls.
- Every scene has ≥1 listening moment (spoken NPC line carrying needed information) and ≥1 production moment (choice or open response).
- Dialogue graphs must be terminal and orphan-free (per content validation gates); all branches reconverge on canonical story beats — consequences persist as state, not as divergent plots.
- Captions/transcripts exist for all audio (asset policy).

## 6. Language constraints

- StoryArc learner-facing dialogue is English; Indonesian may appear only as approved UI scaffolding (open decision) — never inside canonical English dialogue lines.
- Grade-banded complexity: G10 ≤ ~12-word average NPC turns, high-frequency vocabulary; G11 allows multi-clause argument; G12 allows professional register and abstract future talk.
- New-language load per episode: ≤8 new expressions; recycled ≥ new from Arc 2 of each season onward.
- No Japanese content, no romanized Japanese, no copyrighted-anime catchphrases.

## 7. John dialogue rules (AI-backed turns)

Scripted John lines follow the Character Bible. AI-backed John turns define per content item: learning context, expected student intent, tutor goal, relevant language, acceptable response dimensions, and contextual follow-up intent. John coaches with the four feedback lenses, max 1–2 points per turn, and never resolves a story choice for the player.
