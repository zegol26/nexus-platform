# StoryArc Content Generation Report

Generated on 2026-07-14 for `initial-90-release-1`.

## 2026-07-15 listening correction amendment

The Grade 10 and Grade 12 TOEIC-style packages contained 21 direct-listening questions whose visible `optionsEn` values were only `A`, `B`, `C`, and `D`, even though the full spoken choices were present in `transcriptEn`. The repair expanded every placeholder to its full answer sentence, added missing question-response prompts, and published immutable revisions `ex-g10-03@2` and `ex-g12-02@2`. Their former published revisions are `SUPERSEDED`; the canonical catalog remains exactly 90 published items.

The Exam Lab runtime now exposes a per-question **Play full question** control for direct listening items. The spoken script is ordered as question number, learner-visible stem, then choices A-D. If the authored transcript already contains its own question stem (for example a `Q:` question-response item), the composer does not prepend or duplicate it. The complete script is sent to the private `/api/voice/speak` path, which creates a content-addressed audio asset on first use and reuses the database cache afterward. The transcript is disclosed only in post-check review. Import schema and release validation now block sequential letter-only option sets so this defect cannot silently re-enter a future package.

## Release status

The nine StoryArc packages contain the fixed release allocation of 90 items: 45 School Core, 27 Story Mode, and 18 Exam Lab, with 30 items per grade. On 2026-07-14 the product owner explicitly instructed that all items be lifecycle-published; the canonical database now reports all 90 release items as `PUBLISHED` and the former foundation revision as `SUPERSEDED`. This operational publication is not academic, final-audio, accessibility, or IP approval.

The Phase E/F mapping remains descriptive. The academic lead has not supplied verified official CP identifiers, so every package intentionally retains `UNVERIFIED_PROJECT_MAPPING`. No curriculum identifier was invented during this repair.

## Corrections applied

- Bound all 45 School Core items to grade-specific analytic rubrics.
- Bound the 17 Story Mode items that contain assessed or recall-evidence choices to grade-specific Story evidence rubrics. All 60 Story recall-evidence choices now resolve through an item assessment binding.
- Added grade-specific selected-response and mock-exam rubric definitions where they were absent. Existing speaking, writing, presentation, and letter rubrics were preserved.
- Split the conflicting Grade 11 vocabulary identity: `voc-membership` retains the status/affiliation meaning and `voc-membership-count` identifies the number-of-members data sense.
- Normalized `exp-ill-cover` to the approved presentation/listening source intent.
- Corrected recall-hook lineage for `rh-i-see-your-point-but`, `rh-it-turns-out-g11`, `rh-so-what-does-this-mean`, `rh-thats-on-me`, and `rh-could-you-rephrase`.
- Corrected Grade 12 interview recall to reuse the established Grade 10 clarification expression `exp-could-you-say-that-again` instead of declaring a conflicting local identity.
- Added 221 blueprint-required Exam questions using deterministic, self-contained school/workplace contexts. No runtime AI generation is required.
- Added a rationale for every option in all 350 Exam selected-response questions. Existing answer keys and author explanations were retained unless the new question was authored in this repair.

## Exam counts fixed at generation

`Questions` includes selected-response questions, interview prompts, and structured Q&A prompts as counted by the release validator. `Tasks` contains separately scored constructed-response tasks.

| Item | Questions | Tasks | Questions added in this repair |
| --- | ---: | ---: | ---: |
| ex-g10-01 | 20 | 0 | 12 |
| ex-g10-02 | 16 | 2 | 10 |
| ex-g10-03 | 20 | 0 | 12 |
| ex-g10-04 | 20 | 0 | 10 |
| ex-g10-05 | 5 | 0 | 0 |
| ex-g10-06 | 40 | 1 | 28 |
| ex-g11-01 | 16 | 1 | 8 |
| ex-g11-02 | 24 | 0 | 16 |
| ex-g11-03 | 24 | 0 | 14 |
| ex-g11-04 | 5 | 0 | 0 |
| ex-g11-05 | 2 | 1 | 0 |
| ex-g11-06 | 44 | 1 | 31 |
| ex-g12-01 | 16 | 1 | 10 |
| ex-g12-02 | 30 | 0 | 17 |
| ex-g12-03 | 30 | 0 | 16 |
| ex-g12-04 | 6 | 0 | 0 |
| ex-g12-05 | 3 | 1 | 0 |
| ex-g12-06 | 50 | 1 | 37 |

There are no declared count exceptions. Each item matches `STORYARC_EXAM_BLUEPRINT.md` and the validator's fixed target table.

## Audio generation

Forty pending listening blocks were synthesized locally from their existing English transcripts. No transcript was sent to an external service.

- Generator: Microsoft Speech API, `Microsoft David Desktop` English voice.
- Encoding: mono MP3 at 96 kbps through `@breezystack/lamejs`.
- Output: 40 content-hashed files under `public/storyarc/audio/`, totaling 36,443,954 bytes.
- Binding: each listening block declares `audioAssetId`, retains its transcript/caption source, and uses `generated-audio-temporary-approved`.
- Provenance: each package asset record includes generator, rights owner, commercial/derivative flags, SHA-256 content hash, MIME type, byte size, and immutable storage path.
- Disclosure: every generated block carries the Indonesian disclosure `Suara ini dibuat oleh AI dan menunggu persetujuan final editor akademik.`

These files are implementation-complete but temporary. Final publication still requires a human listen-through for pronunciation, pacing, role changes, dates/times, option labels, and accessibility. A production voice replacement must create new immutable asset revisions rather than overwrite these hashes.

Direct TOEIC photo/response questions use the same temporary runtime voice-cache policy described in the amendment above; they are playable but are not human-approved final exam recordings.

### TOEIC Part 1 photograph runtime amendment (2026-07-16)

The Grade 10 and Grade 12 photo-description sections now follow the intended TOEIC-style practice interaction: the learner sees an original photograph, hears descriptions A-D, and selects a letter. Author-only `imageBriefId` text is never rendered or spoken. Full option text and the transcript remain hidden until review.

- Coverage: all 12 authored photo questions resolve to eight unique, scenario-matched photographs; three shared scenarios intentionally reuse the same immutable asset across grades.
- Origin: generated with the built-in OpenAI image-generation workflow for Nexus StoryArc.
- Identity: every depicted person is synthetic and fictional; no real-person reference image or identity was used.
- Setting: Indonesian SMA/SMK uniforms and school environments; no third-party logos or readable institutional marks.
- Storage and provenance: files live under `public/storyarc/exam/toeic-part-1/`; SHA-256, byte size, MIME type, and descriptive alt metadata are recorded in `public/storyarc/asset-manifest.json`.
- Assessment integrity: learner-facing alt text is deliberately non-descriptive so it does not disclose the correct response. Formal accessibility accommodation design remains a human review gate.
- Presentation: photographs preserve their 3:2 source ratio inside a centered responsive card capped at 672 px on desktop, preventing a single item from consuming the full viewport.
- Remaining listening sections: Question–Response now exposes only answer letters before review and plays the spoken question plus responses once; conversation/talk transcripts remain hidden until the learner checks the section.

## Package checksums

Checksums below identify the repaired package state before subsequent lifecycle/import metadata changes.

| Package | SHA-256 |
| --- | --- |
| batch-1-grade10-school-core.json | `981e20fc14237cd055cb937912ecb8f0b059d4095f1ed3563baca14b75b7249c` |
| batch-2-grade10-story-mode.json | `70fa145017de4481128734bae966a0da2f01fe21c5d202e7dc0bd0a958965acc` |
| batch-3-grade10-exam-lab.json | `d0be42cee686dc22660b510fc3c5a397dd3fbfc286e497370158b3f5cbea553b` |
| batch-4-grade11-school-core.json | `ab834964e6410652149358c09c6b5733ab1dfceb05c91665ca773fe2887d70d3` |
| batch-5-grade11-story-mode.json | `e342dced0c8ee48483a29f4a7e358d2475e4d919a58f8d1ae578d3c34f3cc6ac` |
| batch-6-grade11-exam-lab.json | `0cb07fe0e533b47207c0a32c893bee3654725addbff1fe5b9c78f1e7ce214cd9` |
| batch-7-grade12-school-core.json | `e66f01a17d7e5bafe83f5d90d8550bbe9c3a3b7777588e2a39103f1e197a3ad6` |
| batch-8-grade12-story-mode.json | `8c8ccd81cff0682597fdb97f86ac9109e310d332b56a8f90aa22382890e3ccf2` |
| batch-9-grade12-exam-lab.json | `c6adde92a673e862d00660ace48cd9b51b70b2bc86cde86509388440c00289a8` |

## Known release exceptions and human decisions

- Curriculum source authority: unresolved; academic-lead action required.
- Audio editorial approval: unresolved; temporary assets must be reviewed or replaced before publication.
- Summative AI scoring for speaking/writing: unresolved; manual-review path remains authoritative.
- Timed section runtime and production Exam UI: outside this content-generation report and must be verified separately before a release-ready claim.
- Generated distractors/rationales: repository validation checks completeness and structure, but an academic editor must still review difficulty, ambiguity, and bias.
