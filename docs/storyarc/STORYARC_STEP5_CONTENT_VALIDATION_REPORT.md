# StoryArc Step 5 Content Validation Report

> Historical report: this records the pre-repair failure state. On 2026-07-14 the listed content defects were repaired, the semantic validator passed with zero errors, and the 90-item release was imported as DRAFT. See `STORYARC_CONTENT_GENERATION_REPORT.md` for the current content state. Human review and publication remain outstanding.

Updated: 2026-07-14 JST.

Status: **FAIL — ingestion blocked before any database write**.

This report validates the nine structured packages in `prisma/data/storyarc/` against the Phase A package schema, the release-wide learning graph, the StoryArc design authorities, and the Exam Blueprint. The package-level schema validator accepts all nine files, but release-wide semantic and publication-eligibility checks fail. The content was therefore not ingested or published.

## Primary allocation

| Dimension | Actual | Required | Result |
| --- | ---: | ---: | --- |
| School Core | 45 | 45 | PASS |
| Story Mode | 27 | 27 | PASS |
| Exam Lab | 18 | 18 | PASS |
| Total | 90 | 90 | PASS |
| Grade 10 | 30 | 30 | PASS |
| Grade 11 | 30 | 30 | PASS |
| Grade 12 | 30 | 30 | PASS |
| Phase E | 30 | 30 | PASS |
| Phase F | 60 | 60 | PASS |

The release contains 22 unique competencies, 45 unique objectives, and all six approved skill enums. Package-level stable item IDs, phase/grade mapping, objective references, scene nodes, dialogue edges, assets, characters, and locations pass. The automated prohibited-IP term scan has no finding; this is not a claim of copyright clearance.

## Blocking findings

### REFERENCE and LEARNING GRAPH

Stable identities have conflicting definitions and cannot be merged without semantic review:

- `voc-membership`: `sc-g11-05` means *keanggotaan* while `sc-g11-11` means *jumlah anggota* and uses a different source/hook.
- `exp-ill-cover`: `sc-g11-09` and `sm-g11-07`/`sm-g11-08` assign different source-intent identities to the same stable expression ID.
- `rh-i-see-your-point-but`: the same hook points to `obj-g11-02` and `obj-g11-01`.
- `rh-it-turns-out-g11`: the same hook points to `obj-g11-08`, `obj-g11-13`, `obj-g12-10`.
- `rh-so-what-does-this-mean`: the same hook points to `obj-g11-11` and `obj-g11-09`.
- `rh-thats-on-me`: the same hook points to `obj-g11-12`, `obj-g11-15`, `obj-g11-08`.
- `rh-could-you-rephrase`: the same hook points to `obj-g12-05` and `obj-g10-12`.

Exact repeated catalog declarations can be deduplicated without changing meaning. Conflicting stable definitions cannot. Claude/content review must choose the authoritative stable identity or issue distinct IDs with corrected references.

The release declares 180 vocabulary rows (179 unique IDs), 319 expression rows (237 unique IDs), 181 recall hooks (105 unique IDs), and 81 recall references. All recall references resolve to a release entry/hook, but the five conflicting hook identities above make the graph unsafe to canonicalize.

### ASSESSMENT and MASTERY

- All 45 School Core items contain an `ASSESSED_EVIDENCE` mastery check but have no item-level assessment/rubric binding. Selecting a rubric is a semantic assessment decision; repository code cannot invent it.
- Seventeen Story Mode items contain 64 evidence-classified dialogue choices without an item-level assessment/rubric binding: 60 `RECALL_EVIDENCE` choices and four `ASSESSED_INTERACTION` choices. The affected items are `sm-g10-08`, `sm-g10-09`, `sm-g11-02`, `sm-g11-04`, `sm-g11-05`, `sm-g11-06`, `sm-g11-08`, `sm-g11-09`, and `sm-g12-01` through `sm-g12-09`. The four assessed choices are in `sm-g12-08`.
- Ten Exam Lab items reference rubric revisions that are not defined anywhere in the release: `ex-g10-01`, `ex-g10-03`, `ex-g10-04`, `ex-g10-06`, `ex-g11-02`, `ex-g11-03`, `ex-g11-06`, `ex-g12-02`, `ex-g12-03`, `ex-g12-06`. Missing IDs are the grade-level `rubric-*-mcq-v1` and `rubric-*-mock-v1` revisions.
- All 129 Exam Lab selected-response questions lack the Exam Blueprint's required per-option rationales. The questions do contain a single correct answer index and a general explanation; option-by-option distractor rationales require authorship and cannot be generated as a formatting repair.
- No malformed options, invalid answer indexes, missing general explanations, duplicate per-item question IDs, or duplicate per-item stems were detected.

Mastery projection is additionally blocked by the unresolved product decision for mastery scale, evidence weights, recency, difficulty, minimum evidence, and proficiency bands. Phase A intentionally stores causal evidence without inventing this algorithm.

### COUNT

The required `STORYARC_CONTENT_GENERATION_REPORT` is absent. The Exam Blueprint says final generated counts must be fixed in that report. Thirteen Exam Lab items are also below their blueprint targets:

| Item | Package | Blueprint target |
| --- | --- | --- |
| `ex-g10-01` | 8 questions | 20 questions |
| `ex-g10-02` | 6 questions + 2 tasks | 16 questions + 2 tasks |
| `ex-g10-03` | 8 questions | 20 questions |
| `ex-g10-04` | 10 questions | 20 questions |
| `ex-g10-06` | 12 questions + 1 task | 40 questions + 1 task |
| `ex-g11-01` | 8 questions + 1 task | 16 questions + 1 task |
| `ex-g11-02` | 8 questions | 24 questions |
| `ex-g11-03` | 10 questions | 24 questions |
| `ex-g11-06` | 13 questions + 1 task | 44 questions + 1 task |
| `ex-g12-01` | 6 questions + 1 task | 16 questions + 1 task |
| `ex-g12-02` | 13 questions | 30 questions |
| `ex-g12-03` | 14 questions | 30 questions |
| `ex-g12-06` | 13 questions + 1 task | 50 questions + 1 task |

`ex-g10-05`, `ex-g11-04`, `ex-g11-05`, `ex-g12-04`, and `ex-g12-05` structurally match the blueprint prompt/task shape. No filler was created.

### IMPLEMENTATION GAP and CURRICULUM SOURCE

- Thirty-five items contain 39 `transcript-only-pending-audio` blocks and no release-ready audio asset. The Exam Blueprint requires an audio asset reference plus script/caption/transcript for every audio item. These blocks are not publication eligible.
- All nine packages declare `UNVERIFIED_PROJECT_MAPPING`. The package validator emits nine `CURRICULUM_SOURCE_GAP` warnings until an academic lead supplies verified Phase E/F authority identifiers.
- The approved transcript/conversation/voice retention period, StoryArc AI/STT/TTS quotas, John visual/voice licensing decision, and whether AI-scored speaking/writing may be summative remain unresolved. These block safe John, voice, interview persistence, and authoritative speaking-evidence implementation.

## Repository-compatible normalization

No source package was modified. If corrected content passes the semantic gate, repository-side normalization may:

- deduplicate byte-identical competency, objective, vocabulary, expression, and recall-hook declarations;
- preserve the package's existing `sm-g10-01@2` revision, which avoids colliding with the published Phase A `sm-g10-01@1` fixture;
- normalize syntax, field names, and deterministic IDs only where references are updated and meaning is unchanged.

It may not choose among conflicting stable definitions, author missing distractor rationales/rubrics/audio, reclassify evidence choices, or create missing exam questions.

## Import preflight and canonical state

`npm run preflight:storyarc-content` performs the existing importer in dry-run mode. It reports 90 candidate creates and zero revision conflicts, including `sm-g10-01@2`. At preflight time the database contains only the Phase A fixture as the published canonical StoryArc content. Because the release validator fails, no importer write or lifecycle transition was executed, and the 90-item canonical-source count was not claimed.

## Commands

- `npm test` — PASS; 13 policy tests, English DCE regression checks, and 11 StoryArc foundation tests passed.
- `npx tsc --noEmit --pretty false` — PASS.
- `npx prisma migrate status` — PASS; 29 migrations found and the local PostgreSQL schema is current.
- `npm run validate:storyarc-content` — expected FAIL; 35 blocking release findings and nine curriculum-source warnings.
- `npm run preflight:storyarc-content` — PASS; dry-run only, 90 creates, zero conflicts, zero writes.
- `npm run lint` — PASS with zero errors and 10 pre-existing warnings outside the Step 5 validation scripts.
- `npm run build` — PASS; Prisma migration deploy/generate and the Next.js 16.2.4 production build completed successfully. The build intentionally skipped the seed.

No production deployment or Git push was performed.
