# StoryArc Product Challenge

Step 2 design authority: curriculum/content design only. Technical constraints come from the Codex StoryArc architecture documents in `docs/storyarc/`. This document challenges the product before any content generation.

## Verdict

**VIABLE WITH STRUCTURAL CORRECTIONS.** The 50/30/20 product mix and 90-item initial release are workable, but only if the three tracks operate as one learning graph with enforced integration rules. Designed as three parallel catalogs, the product fails on retention, speaking evidence, and SMK relevance. The corrections below change how the distribution operates, not the distribution itself.

## Challenge findings

### 1. Learning coherence — FAILS without an integration invariant

45 lessons + 27 episodes + 18 tests is three products. Correction adopted: every Story Mode episode must **apply at least 2 same-grade School Core items** and (from Episode 2 onward) **recall at least 1 earlier item**, and at least 80% of Exam Lab scored items must trace to a School Core learning objective. These are content validation rules, recorded in `STORYARC_LEARNING_JOURNEY_MATRIX.md`, and should become release validators (Codex owns implementation).

### 2. Student retention — WEAK in a School-Core-first sequence

If learners must finish School Core before touching Story Mode, the anime-inspired promise is invisible for weeks. Correction: per grade, content is sequenced in **interleaved waves** — a Story arc unlocks after its 4–5 prerequisite School Core items, not after all 15. Recommended-order metadata lives in content; gating policy is a product decision (see gaps).

### 3. Grade appropriateness — PASSES with the maturity ladder

Grade 10 = adaptation/school life, Grade 11 = collaboration/projects/conflict, Grade 12 = future/career/interviews. The story matures with the learner (see `STORYARC_SEASON_ARC_PLAN.md`); the "new student" premise is used exactly once.

### 4. SMA applicability — PASSES

School Core aligns to Phase E/F text types and interaction competencies; Exam Lab includes school-exam-style practice per semester band.

### 5. SMK applicability — FAILED as originally framed; corrected

A purely academic school story excludes SMK learners. Corrections: (a) the universe is a fictional **integrated SMA–SMK campus**, so workshops, practicum, and vocational identity are canon, not flavor; (b) each grade's School Core includes explicitly vocational-context items (procedures, workplace calls, safety briefings, internship logs); (c) Grade 12 Story Mode Arc 8 is an internship arc; (d) interview content covers both job and further-study paths.

### 6. Natural English quality — AT RISK; mitigated by rules

Risk: textbook-English dialogue and corporate register in teen scenes. `STORYARC_DIALOGUE_DESIGN_RULES.md` bans binary correct/wrong/ridiculous choice sets, requires communication-dimension distractors, and defines register per scene type.

### 7. Story-to-learning integration — the core correction

Story Mode is redefined as the **EXPERIENCE / PRACTICE / RECALL layer** of the learning model, never an independent syllabus. Every episode declares: applied School Core references, expression unlock list, recall targets, and evidence eligibility per interaction.

### 8. Assessment validity — PASSES with constraints

Exam Lab items map to the learning graph; TOEIC-style content is original with no ETS affiliation implied; speaking scoring is transcript-based on defined dimensions with no fake pronunciation scoring (`STORYARC_EXAM_BLUEPRINT.md`). Summative status of AI-scored speaking/writing remains an open Codex/product decision.

### 9. Anime gimmick risk — REAL; mitigated

Mitigations: original IP with an Indonesian setting; story stakes come from communication problems (misunderstanding, conflict, persuasion, interviews), so the plot cannot advance without using target language; recall events are woven into the narrative rather than bolted on. If art is removed, the scenes must still be defensible communication tasks — that is the test applied to every episode.

### 10. Cognitive load — AT RISK; capped

Caps adopted: max 12 new expressions + 10 vocabulary items per School Core item; max 8 new expressions per episode; every episode reuses more language than it introduces from Arc 2 onward; one primary language objective per episode (supporting objectives limited to 2).

### 11. Game reward distortion — CONTROLLED by architecture

Codex architecture already separates Story XP from mastery. Content-side rule added: no choice text may promise learning credit; assessed interactions are visibly distinct from narrative choices (see evidence intent labels in the manifest).

### 12. Curriculum gaps — FLAGGED, not filled

Verified Capaian Pembelajaran identifiers are not present in project materials. Coverage is expressed against the approved Phase E (Grade 10) and Phase F (Grade 11–12) mapping using descriptive competency areas. All unverifiable references are flagged **CURRICULUM SOURCE GAP** in `STORYARC_CURRICULUM_COVERAGE_MATRIX.md`.

### 13. Weak speaking evidence — the biggest validity risk; partially correctable in content

Corrections: ≥ 6 of 15 School Core items per grade have speaking or listening as the primary skill; every grade's Exam Lab includes one dedicated speaking assessment (interview or presentation); speaking feedback dimensions are defined (relevance, grammar, vocabulary, naturalness, clarity of idea). Remaining dependency: transcript-based scoring service and human-review path are implementation capabilities (see gaps).

### 14. Student ability variation — PARTIALLY addressed

Content provides: John formative support on demand, retry-with-coaching on practice tasks, and choice sets where more than one option is acceptable (with differentiated feedback). Not solved by content: placement, adaptive sequencing, and remedial branching — flagged as CONTENT REQUIREMENT / IMPLEMENTATION GAP (adaptive recommendation capability), not designed against unsupported repository features.

### 15. Content scalability — PASSES

The 90→180 growth adds items through releases, not new structures. IDs, arcs, and recall-link conventions in the manifest are designed for the 180 target (second season wave per grade extends existing arcs).

## How the 50/30/20 distribution operates (adopted model)

The distribution is not challenged; its operation is redefined:

- **School Core (50%) = SOURCE + UNDERSTAND/USE.** Introduces objectives, language, and expressions; contains the active production task; feeds both other tracks.
- **Story Mode (30%) = EXPERIENCE + PRACTICE + RECALL.** Applies School Core language in consequence-bearing situations; unlocks expressions as exposure; hosts delayed recall events; only rubric-declared interactions are evidence-eligible.
- **Exam Lab (20%) = PROVE.** Converts the same objectives into assessed evidence: school-exam practice, TOEIC-style practice, interview, mock exam.

One objective therefore travels: School Core introduction → Story application → later Story recall → Exam Lab evidence. The journey matrix documents this per objective.

## CONTENT REQUIREMENT / IMPLEMENTATION GAP register

Requirements the content design needs but the approved architecture does not yet provide. None are assumed to exist.

| # | Requirement | Why content needs it | Architecture status |
| --- | --- | --- | --- |
| G1 | Spaced recall scheduler / trigger policy | Recall events need a delay/trigger mechanism beyond "next episode contains a recall scene" | Evidence records exist in expected schema; no scheduling policy or runtime is defined |
| G2 | Transcript-based speaking scoring service with rubric + human-review path | Exam Lab interview/presentation items; formative Story speaking feedback | Open decision (summative AI scoring); interview manual-review pattern reusable per reuse matrix |
| G3 | Acoustic pronunciation evaluation | Only if pronunciation is ever scored; content design deliberately excludes it | Not designed; explicitly out of scope for content |
| G4 | Listening/dialogue audio production pipeline with captions | Every listening item and Story scene needs recorded or TTS audio + captions | Asset policy defines manifest/budgets; no production pipeline exists |
| G5 | Sectioned, timed mock-exam session runtime | Grade mock exams have timed sections | Attempts store timing; multi-section timed runtime unconfirmed |
| G6 | Adaptive recommendation from practice evidence | Ability-variation support beyond retry/coaching | Architecture allows practice records to update recommendations; no engine exists |
| G7 | Story gating policy (prerequisite enforcement vs. recommendation) | Interleaved wave sequencing | Content declares prerequisites; enforcement policy undecided |

## CURRICULUM SOURCE GAP register

| # | Gap |
| --- | --- |
| C1 | No verified Capaian Pembelajaran identifier text for Phase E or Phase F exists in project materials. Coverage uses descriptive competency areas only. |
| C2 | No verified SMK English (Muatan Kejuruan/vocational English) supplement is in project materials; vocational relevance is designed from general Phase E/F communication competencies applied to vocational contexts. |
| C3 | No verified semester-level ATP (Alur Tujuan Pembelajaran) sequence is available; sequencing is a design proposal, not an official order. |
| C4 | CEFR levels are not asserted anywhere in the design; difficulty bands are internal (see skill distribution doc). |
| C5 | TOEIC score claims are not made; Exam Lab items are "TOEIC-style practice" with an explicit no-affiliation disclaimer. |

## Design package index

This challenge governs: `STORYARC_LEARNING_JOURNEY_MATRIX.md`, `STORYARC_CURRICULUM_COVERAGE_MATRIX.md`, `STORYARC_SKILL_DISTRIBUTION.md`, `STORYARC_UNIVERSE_BIBLE.md`, `STORYARC_CHARACTER_BIBLE.md`, `STORYARC_SEASON_ARC_PLAN.md`, `STORYARC_DIALOGUE_DESIGN_RULES.md`, `STORYARC_VOCABULARY_EXPRESSION_STRATEGY.md`, `STORYARC_EXAM_BLUEPRINT.md`, `STORYARC_CONTENT_MANIFEST.md`.
