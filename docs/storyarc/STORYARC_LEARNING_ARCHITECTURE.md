# StoryArc Learning Architecture

## Core rule

Player progression and English mastery are separate projections over different events.

- Story XP, level, arc completion, quests, relationships, and narrative achievements belong to player progression.
- Listening, speaking, reading, writing, grammar, and vocabulary belong to English mastery.
- Story XP never changes mastery.
- Completing a scene can create exposure or practice evidence; only rubric-backed assessed or recall evidence changes mastery.

## Repository baseline

Current scoring is fragmented:

- `NihongoAssessmentSession` stores aggregate scores and `NihongoAssessmentAnswer` stores item/category correctness.
- `NihongoMockTestAttempt/Answer` stores test score and item correctness.
- `EnglishInterviewReview` stores pronunciation, fluency, grammar, vocabulary, confidence, and overall manual scores.
- Nihongo and Arabic quizzes emit `AnalyticsEvent` metadata; DCE uses client state and analytics without a durable attempt/evidence ledger.
- `UserGameProfile`, `GameKingdom`, and `lib/gamification/kingdom.ts` track XP/counters/achievements, not mastery.
- Direct learning reward endpoints accept client-supplied claims; `docs/known-issues.md` already flags the need for stronger server validation.

No current model can answer “Why did this student’s Speaking mastery change?” across apps because there is no append-only, rubric-referenced evidence ledger and projection history.

## Evidence taxonomy

| Evidence class | Definition | Changes mastery? | StoryArc examples |
| --- | --- | --- | --- |
| EXPOSURE | Learner viewed/heard content without a scored response | No | Dialogue heard, vocabulary first encountered, reading opened |
| PRACTICE | Learner responded and received coaching, but conditions are formative or uncalibrated | No direct score; may update practice recommendations | Rehearsal choice, unscored John conversation, guided grammar retry |
| ASSESSED_EVIDENCE | Response scored against a published rubric under known conditions | Yes | Exam Lab item, speaking rubric, School Core quiz attempt |
| RECALL_EVIDENCE | Delayed retrieval scored against a published item/rubric | Yes | Spaced vocabulary recall, expression reconstruction after an interval |

Exposure and practice remain valuable for engagement, recommendations, and unlocks. They cannot be converted into mastery points by a fixed XP ratio.

## Explainable evidence record

Expected future relational shape, expressed without creating a migration in this audit:

```text
LearningAttempt
  id, userId, appSlug, itemId, itemRevisionId, mode,
  startedAt, submittedAt, status, idempotencyKey

LearningEvidence
  id, attemptId, userId, appSlug, evidenceClass,
  competencyKey, skillKey, objectiveKey, rubricRevisionId,
  rawScore, maxScore, normalizedScore, confidence,
  sourceItemId, sourceItemRevisionId, occurredAt,
  evaluatorType, evaluatorRef, metadata

MasteryProjection
  userId, appSlug, skillKey, score, band, evidenceThrough,
  algorithmVersion, updatedAt

MasteryProjectionChange
  id, userId, appSlug, skillKey, beforeScore, afterScore,
  algorithmVersion, evidenceIds, reasonCode, createdAt
```

`LearningEvidence` is append-only. Corrections create superseding/reversal evidence rather than overwriting history. `MasteryProjection` is rebuildable. `MasteryProjectionChange.evidenceIds` answers why a score changed.

## Mastery update contract

For each assessed or recall submission:

1. Resolve the immutable item revision and rubric revision.
2. Validate the learner’s attempt and timing server-side.
3. Score each competency/skill criterion independently.
4. Write one or more evidence records in the same transaction as attempt finalization.
5. Recompute affected skill projections with a versioned deterministic algorithm.
6. Write a projection-change record referencing every included evidence ID.
7. Return learner-facing feedback and the before/after projection.

The algorithm is a product decision. The architecture supports weighted recency, evidence confidence, difficulty, assessor reliability, and minimum evidence counts, but implementation cannot select weights until the open decisions are resolved.

## Skill model

Required top-level skills:

- listening;
- speaking;
- reading;
- writing;
- grammar;
- vocabulary.

Competencies and objectives form a content-controlled taxonomy below these skills. Examples include listening for detail, interactional fluency, cohesive writing, tense control, and productive vocabulary. Stable keys survive wording changes; display labels live in published content.

## StoryArc track behavior

### School Core

- Canonical item revision carries grade, phase, objectives, competencies, and rubric references.
- Lesson viewing creates exposure; formative drills create practice; end checks can create assessed evidence.
- Completion is separate from mastery. A learner can complete an item without passing its assessed objective.

### Story Mode

- Scene choices update story state and can unlock vocabulary or expressions.
- Dialogue comprehension or spoken responses create practice unless the item declares a published rubric and controlled assessment conditions.
- Relationship gains and quest completion affect player state only.
- A later recall checkpoint can create recall evidence tied to the original vocabulary/expression ID.

### Exam Lab

- Every scored item is revisioned and has answer/rubric lineage.
- Attempts store timing, selected answers or response asset references, and item revision.
- Speaking/writing AI scores require stored rubric version, evaluator model/prompt version, confidence, and a review path for low-confidence cases.

## Vocabulary and expression architecture

Canonical definition fields belong in versioned content: lemma/expression, part of speech, meaning, examples, audio/asset references, grade, competency tags, and provenance.

Learner state uses separate records/projections:

- encountered at and source scene/item;
- unlocked at and reason;
- practice count and last practiced at;
- last recall result;
- next recommended review;
- mastery evidence IDs.

Unlock is a player/content-discovery event. Recall success is learning evidence. The two must not share one boolean.

## Progress and completion

Use stable item identity plus immutable revision identity.

- `ItemProgress`: status, last position/checkpoint, completed revision, first/last access.
- `LearningAttempt`: each response session.
- `ContentCompletion`: server-confirmed completion event, idempotent by user/item/revision.
- Story scene save is owned by player state, not by learning completion.

Analytics mirrors usage but is not the source of truth. This avoids the current Arabic/reading pattern where completion must be reconstructed from generic events.

## Certificates, badges, and achievements

- Course certificate eligibility uses canonical required-item completion plus any configured mastery threshold; it never uses Story XP.
- Learning badges reference evidence or completion records.
- Narrative achievements reference player-state transitions.
- A display layer may show both, but records and rules remain distinct.

## AI tutoring

John can coach StoryArc learners through an explicit StoryArc context adapter. Tutor output is formative by default. It becomes assessed evidence only through a controlled scoring service with a published rubric and recorded evaluator version. Free conversation history must not alter mastery.

## Required validation tests

- XP/quest/relationship events cannot call mastery projection code.
- exposure and practice records cannot change mastery score;
- assessed/recall evidence without an immutable rubric is rejected;
- every mastery delta returns evidence IDs and algorithm version;
- retry/idempotency cannot duplicate completion, reward, or evidence;
- archived content revisions remain readable for historical attempts;
- StoryArc events always use `appSlug=storyarc`;
- English, Nihongo, Arabic, PMP, and Kingdom projections remain unchanged by StoryArc mutations.
